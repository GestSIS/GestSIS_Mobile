import AuthService from "../services/AuthService.ts";
import type { Sis } from "../models/sis.ts";
import { reactive, ref } from "vue";
import { usePersistentStore } from "../hooks/usePersistentStore.ts";
import useStore from "./useStore.ts";
import Api from "../http/Request.ts";
import { jwtDecode } from "jwt-decode";

interface JwtAuthPayload {
  data: {
    permissions: Record<string, string[]>;
    pseudo: string;
    mobiles: (number | string)[];
    admin: boolean;
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
  admin: boolean;
  sis: string[];
}

const emptyState = {
  pseudo: null,
  email: null,
  accessToken: "",
  refreshToken: "",
  statut: UserStatus.disconnected,
  permissions: {},
  admin: false,
  sis: [],
};

const state = reactive<{ data: User }>({ data: { ...emptyState } });
const activeSisKey = ref<string>("");
const activePermissions = ref<string[]>([]);
const lastSync = ref<Date | null>(null);
// Liste complète des SIS (chargée à la demande pour les admins).
const allSis = ref<Sis[]>([]);

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
    // Un admin peut basculer sur n'importe quel SIS, même sans entrée de
    // permission locale : le backend l'autorise via le flag `admin` du JWT
    // (cf. JwtTokenValidatorRole) et hasPermission() lui accorde déjà tous
    // les droits.
    if (!sisKey || (!isKnownSis && !state.data.admin)) {
      console.error("Invalid key :" + sisKey);
      return false;
    }

    activePermissions.value = state.data.permissions[sisKey] ?? [];
    activeSisKey.value = sisKey;

    Api.setSisKey(sisKey);
    await persist();
    return true;
  };

  // Charge la liste complète des SIS (réservé aux admins) pour permettre de
  // basculer sur n'importe quel SIS depuis l'écran Paramètres.
  const loadAllSis = async (): Promise<void> => {
    if (!state.data.admin) return;
    try {
      const res = (await AuthService.sisListe()) as unknown;
      allSis.value = Array.isArray(res)
        ? (res as Sis[])
        : ((res as { data?: Sis[] })?.data ?? []);
    } catch {
      // Hors ligne / erreur : le sélecteur retombe sur les SIS de l'utilisateur.
    }
  };

  const setTokens = async (
    accessToken: string,
    refreshToken: string,
    email: string | null,
  ) => {
    const { permissions, pseudo, mobiles, admin } =
      jwtDecode<JwtAuthPayload>(accessToken).data;
    const transformedMobiles = mobiles.map((sis) => String(sis));

    const availableSis = Object.keys(permissions)
      .map((sis) => sis.toString())
      .filter((sis) => transformedMobiles.includes(sis));
    const filteredPermissions = Object.fromEntries(
      Object.entries(permissions).filter(([sis]) =>
        transformedMobiles.includes(sis),
      ),
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
    state.data.admin = admin;
    state.data.statut = UserStatus.connected;

    await persist();
  };

  /** Log in */
  const login = async (email: string, password: string) => {
    // Login request
    const { accessToken, refreshToken } = await AuthService.login({
      email,
      password,
    });

    // const userId = user.id;
    await setTokens(accessToken, refreshToken, email);

    // Select first sis;
    const res = await selectSis(state.data.sis[0]);
    if (!res) {
      throw "Vous n'avez pas les droits requis pour utiliser cette application";
    }

    // Set access token
    Api.setTokens(accessToken, refreshToken);

    // Load data
    const store = useStore();
    await store.syncAll();

    return Promise.resolve();
  };

  /** Log in */
  const reconnect = async (email: string, password: string) => {
    // Login request
    const { accessToken, refreshToken } = await AuthService.login({
      email: state.data.email ?? email,
      password,
    });

    // const userId = user.id;
    await setTokens(accessToken, refreshToken, state.data.email ?? email);

    // Check si l'utilisateur à toujours les droits pour ce SIS
    if (!state.data.sis.includes(activeSisKey.value)) {
      const res = await selectSis(state.data.sis[0]);
      if (!res) {
        throw "Vous n'avez plus les droits requis pour utiliser cette application";
      }
    }

    // Set access token
    Api.setTokens(accessToken, refreshToken);

    // Load data
    const store = useStore();
    await store.syncAll();

    return Promise.resolve();
  };

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
    store.reset();
    state.data = { ...emptyState };
    Api.clearTokens();
    Api.setSisKey("");
    activePermissions.value = [];
    activeSisKey.value = "";
    persist();
  };

  const isLoggedIn = () => {
    return (
      state.data.statut === UserStatus.connected ||
      state.data.statut === UserStatus.isExpired
    );
  };

  const isLoggedInExpired = () => {
    return state.data.statut === UserStatus.isExpired;
  };

  const hasPermission = (permission: string) => {
    return (
      activePermissions.value?.includes(permission) || state.data.admin === true
    );
  };

  return {
    state,
    isLoggedIn,
    isLoggedInExpired,
    login,
    reconnect,
    logout,
    loginExpired,
    selectSis,
    setTokens,
    persist,
    hasPermission,
    activeSisKey,
    allSis,
    loadAllSis,
  };
}
