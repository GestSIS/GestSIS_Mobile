import AuthService from "../services/AuthService.ts";
import { reactive, ref } from "vue";
import { usePersistentStore } from "../hooks/usePersistentStore.ts";
import useStore from "./useStore.ts";
import Api from "../http/Request.ts";
import { jwtDecode } from "jwt-decode";
import { Passkeys, type GetPasskeyOptions } from "@capawesome/capacitor-passkeys";
import { translateWebauthnError } from "../tools/webauthnErrors.ts";

interface JwtAuthPayload {
  data: {
    permissions: Record<string, string[]>;
    pseudo: string;
    mobiles: (number | string)[];
  };
}

const { persistentStore, storageReady } = usePersistentStore();
const store = useStore();

export enum UserStatus {
  disconnected = 0,
  connected = 1,
  isExpired = 2,
}

export interface User {
  pseudo: string | null;
  email: string | null;
  accessToken: string;
  refreshToken: string;
  statut: UserStatus;
  permissions: Record<string, string[]>;
  sis: string[];
}

const emptyState = {
  pseudo: null,
  email: null,
  accessToken: "",
  refreshToken: "",
  statut: UserStatus.disconnected,
  permissions: {},
  sis: [],
};

const state = reactive<{ data: User }>({ data: { ...emptyState } });
const activeSisKey = ref<string>("");
const activePermissions = ref<string[]>([]);
const lastSync = ref<Date | null>(null);

// 2FA — pas de flux de configuration côté mobile (voir GestSIS_APP pour ça) :
// uniquement la vérification d'un compte déjà protégé, au login comme à la
// reconnexion. `twoFactorChallenge` porte le pre-auth token le temps de la
// vérification ; `pendingEmail` mémorise l'email du login en cours (les
// écrans de vérification ne le redemandent pas).
const twoFactorChallenge = ref<string | null>(null);
const twoFactorAvailableMethods = ref<string[]>([]);
const pendingEmail = ref<string | null>(null);

const persistKey = "auth";
const persistActiveSisKey = "auth-siskey";
const lastSyncSuffixe = "last_sync";

/** Load data from local storage */
const init = async () => {
  // Wait for the storage driver to be ready, otherwise get() can resolve to
  // undefined before the DB is created and the stored session is lost
  // (tokens never restored -> every API/sync call goes out unauthenticated).
  await storageReady;
  try {
    const data = await persistentStore.get(persistKey);
    const sisKey = await persistentStore.get(persistActiveSisKey);

    // Guard against missing/corrupted cached values (JSON.parse(undefined) throws).
    state.data = data ? JSON.parse(data) : { ...emptyState };
    activePermissions.value = state.data.permissions[sisKey] ?? [];
    activeSisKey.value = sisKey;
    lastSync.value = await persistentStore.get(persistKey + lastSyncSuffixe);

    if (state.data?.accessToken) {
      Api.setTokens(state.data.accessToken, state.data.refreshToken);
      Api.setSisKey(sisKey);
    }
  } catch {
    // Corrupted session data: start logged out rather than crashing init.
    state.data = { ...emptyState };
  }
};

init();

export default function useAuth() {
  const selectSis = async (sisKey: string): Promise<boolean> => {
    const isKnownSis = sisKey in state.data.permissions;
    if (!sisKey || !isKnownSis) {
      console.error("Invalid key :" + sisKey);
      return false;
    }

    activePermissions.value = state.data.permissions[sisKey] ?? [];
    activeSisKey.value = sisKey;

    Api.setSisKey(sisKey);
    await persist();
    return true;
  };

  const setTokens = async (accessToken: string, refreshToken: string, email: string | null) => {
    const { permissions, pseudo, mobiles } = jwtDecode<JwtAuthPayload>(accessToken).data;
    const transformedMobiles = mobiles.map((sis) => String(sis));

    const availableSis = Object.keys(permissions)
      .map((sis) => sis.toString())
      .filter((sis) => transformedMobiles.includes(sis));
    const filteredPermissions = Object.fromEntries(
      Object.entries(permissions).filter(([sis]) => transformedMobiles.includes(sis)),
    );

    // Throw exception if no permissions and manage the result
    if (availableSis.length == 0) {
      throw { message: "GestSIS Mobile non disponible avec votre compte" };
    }

    // Update state
    state.data.email = email ?? state.data.email;
    state.data.pseudo = pseudo;
    state.data.accessToken = accessToken;
    state.data.refreshToken = refreshToken;
    state.data.sis = availableSis;
    state.data.permissions = filteredPermissions;
    state.data.statut = UserStatus.connected;

    await persist();
  };

  // Termine une authentification réussie (login direct, ou après vérification
  // 2FA) : pose la session, resélectionne le SIS actif si besoin, puis
  // resynchronise. Partagé par login/reconnect/verifyTwoFactor/verifyWebauthnLogin.
  const finishAuthentication = async (
    accessToken: string,
    refreshToken: string,
    email: string | null,
  ) => {
    await setTokens(accessToken, refreshToken, email);

    if (!state.data.sis.includes(activeSisKey.value)) {
      const res = await selectSis(state.data.sis[0]);
      if (!res) {
        throw {
          message: "Vous n'avez pas les droits requis pour utiliser cette application",
        };
      }
    }

    Api.setTokens(accessToken, refreshToken);

    const store = useStore();
    await store.syncAll();
  };

  /** Abandonne une vérification 2FA en cours (retour à l'écran de login). */
  const cancelTwoFactorChallenge = () => {
    twoFactorChallenge.value = null;
    twoFactorAvailableMethods.value = [];
    pendingEmail.value = null;
  };

  /**
   * Réponse de POST /login, commune à login() et reconnect() : session
   * immédiate (`{}`), ou `{ requiresTwoFactor: true }` si le compte est
   * protégé — l'appelant affiche alors l'étape de vérification (voir
   * verifyTwoFactor / verifyWebauthnLogin). Pas de flux de configuration 2FA
   * côté mobile : un compte dont la configuration est obligatoire est refusé
   * avec un message renvoyant vers l'application web.
   */
  const handleLoginResponse = async (
    response: unknown,
    email: string,
  ): Promise<{ requiresTwoFactor?: boolean }> => {
    const data = response as {
      accessToken?: string;
      refreshToken?: string;
      requiresTwoFactor?: boolean;
      requiresTwoFactorSetup?: boolean;
      preAuthToken?: string;
      availableMethods?: string[];
    };

    if (data.requiresTwoFactorSetup) {
      throw {
        message:
          "La double authentification est obligatoire sur ce compte. Configurez-la depuis l'application web GestSIS, puis reconnectez-vous ici.",
      };
    }

    if (data.requiresTwoFactor) {
      twoFactorChallenge.value = data.preAuthToken ?? null;
      twoFactorAvailableMethods.value = data.availableMethods ?? ["totp"];
      pendingEmail.value = email;
      return { requiresTwoFactor: true };
    }

    cancelTwoFactorChallenge();
    await finishAuthentication(data.accessToken as string, data.refreshToken as string, email);
    return {};
  };

  /** Log in, voir handleLoginResponse(). */
  const login = async (email: string, password: string) =>
    handleLoginResponse(await AuthService.login({ email, password }), email);

  /** Reconnexion (session expirée), même contrat que login(). */
  const reconnect = async (email: string, password: string) => {
    const loginEmail = state.data.email ?? email;
    return handleLoginResponse(
      await AuthService.login({ email: loginEmail, password }),
      loginEmail,
    );
  };

  /**
   * Termine une vérification 2FA. Une erreur portant `restart: true` signifie
   * que la vérification ne peut pas être retentée (preAuthToken expiré ou
   * consommé) : l'appelant revient à la saisie du mot de passe.
   */
  const completeTwoFactor = async (verify: (preAuthToken: string) => Promise<unknown>) => {
    const preAuthToken = twoFactorChallenge.value;
    if (!preAuthToken) {
      throw { message: "La vérification a expiré, veuillez vous reconnecter.", restart: true };
    }

    let tokens: { accessToken: string; refreshToken: string };
    try {
      tokens = (await verify(preAuthToken)) as typeof tokens;
    } catch (error: unknown) {
      // preAuthToken valable 5 minutes : au-delà, recommencer le login.
      if ((error as { status?: number })?.status === 401) {
        cancelTwoFactorChallenge();
        throw { message: "La vérification a expiré, veuillez vous reconnecter.", restart: true };
      }
      throw error;
    }

    const email = pendingEmail.value;
    cancelTwoFactorChallenge();
    try {
      await finishAuthentication(tokens.accessToken, tokens.refreshToken, email);
    } catch (error: unknown) {
      // Session ouverte côté serveur mais pas adoptée ici (ex. aucun SIS
      // disponible sur mobile) : la révoquer plutôt que la laisser active.
      if (state.data.refreshToken !== tokens.refreshToken) {
        AuthService.logout(tokens.refreshToken).catch(() => {});
      }
      throw { ...(error as object), restart: true };
    }
  };

  /** Termine le login/reconnect avec un code TOTP ou un code de secours. */
  const verifyTwoFactor = (code: string) =>
    completeTwoFactor((preAuthToken) => AuthService.verifyTwoFactor(preAuthToken, code));

  /** Termine le login/reconnect via une clé de sécurité / biométrie. */
  const verifyWebauthnLogin = () =>
    completeTwoFactor(async (preAuthToken) => {
      const options = await AuthService.getWebauthnLoginChallenge(preAuthToken);
      let response;
      try {
        // La WebView n'expose pas WebAuthn : dans l'app Android, le plugin passe
        // par Credential Manager ; dans un navigateur (`yarn dev`), par l'API web.
        response = await Passkeys.getPasskey(options as GetPasskeyOptions);
      } catch (err) {
        throw { message: translateWebauthnError(err) };
      }
      return AuthService.verifyWebauthnLogin(preAuthToken, response);
    });

  const loginExpired = async () => {
    state.data.statut = UserStatus.isExpired;
  };

  /** Persist data in local storage */
  const persist = async () => {
    await persistentStore.set(persistKey, JSON.stringify(state.data));
    await persistentStore.set(persistActiveSisKey, activeSisKey.value);
    lastSync.value = new Date();
    await persistentStore.set(persistKey + lastSyncSuffixe, lastSync.value);
  };

  /** Logout */
  const logout = () => {
    // Révocation serveur du refresh token, best-effort : un échec (hors-ligne,
    // token déjà expiré) ne doit pas empêcher le nettoyage local.
    if (state.data.refreshToken) {
      AuthService.logout(state.data.refreshToken).catch(() => {});
    }
    store.reset();
    state.data = { ...emptyState };
    Api.clearTokens();
    Api.setSisKey("");
    activePermissions.value = [];
    activeSisKey.value = "";
    persist();
  };

  const isLoggedIn = () => {
    return state.data.statut === UserStatus.connected || state.data.statut === UserStatus.isExpired;
  };

  const isLoggedInExpired = () => {
    return state.data.statut === UserStatus.isExpired;
  };

  const hasPermission = (permission: string) => {
    return activePermissions.value?.includes(permission);
  };

  return {
    state,
    isLoggedIn,
    isLoggedInExpired,
    login,
    reconnect,
    verifyTwoFactor,
    verifyWebauthnLogin,
    cancelTwoFactorChallenge,
    twoFactorChallenge,
    twoFactorAvailableMethods,
    logout,
    loginExpired,
    selectSis,
    setTokens,
    persist,
    hasPermission,
    activeSisKey,
  };
}
