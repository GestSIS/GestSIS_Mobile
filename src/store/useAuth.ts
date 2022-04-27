import AuthService from '@/services/AuthService';
import { reactive, ref } from 'vue';
import { usePersistentStore } from '../hooks/usePersistentStore';
import useStore from './useStore';
import Api from '@/http/Request';
import jwt_decode from 'jwt-decode';

const { persistentStore } = usePersistentStore();
const store = useStore();

export enum UserStatus {
  disconnected = 0,
  connected = 1,
}

export interface User {
  pseudo: string | null;
  email: string | null;
  accessToken: string;
  refreshToken: string;
  statut: UserStatus;
  permissions: any;
  sis: any[];
}

const emptyState = {
  pseudo: null,
  email: null,
  accessToken: '',
  refreshToken: '',
  statut: UserStatus.disconnected,
  permissions: {},
  sis: [],
};

const state = reactive<{ data: User }>({ data: { ...emptyState } });
const activeSisKey = ref<string>('');
const activePermissions = ref<string[]>([]);
const lastSync = ref<Date | null>(null);

const persistKey = 'auth';
const persistActiveSisKey = 'auth-siskey';
const lastSyncSuffixe = 'last_sync';

/** Load data from local storage */
const init = async () => {
  const data = await persistentStore.get(persistKey);
  const sisKey = await persistentStore.get(persistActiveSisKey);

  state.data = JSON.parse(data) || { ...emptyState };
  activePermissions.value = state.data.permissions[sisKey] ?? [];
  activeSisKey.value = sisKey;
  lastSync.value = await persistentStore.get(persistKey + lastSyncSuffixe);

  if (state.data?.accessToken) {
    Api.setTokens(state.data.accessToken, state.data.refreshToken);
    Api.setSisKey(sisKey);
  }
};

init();

export default function useAuth() {
  const selectSis = async (sisKey: string): Promise<boolean> => {
    if (!sisKey || !(sisKey in state.data.permissions)) {
      console.error('Invalid key :' + sisKey);
      return false;
    }

    activePermissions.value = state.data.permissions[sisKey];
    activeSisKey.value = sisKey;

    Api.setSisKey(sisKey);
    await persist();
    return true;
  };

  const setTokens = async (accessToken: string, refreshToken: string) => {
    const { permissions, pseudo, mobiles } = (jwt_decode(accessToken) as any).data;
    const transformedMobiles = mobiles.map((sis: any) => sis.toString());

    const availableSis = Object.keys(permissions).map(sis => sis.toString()).filter(sis => transformedMobiles.includes(sis));
    const filteredPermissions = Object.fromEntries(Object.entries(permissions).filter(([sis]) => transformedMobiles.includes(sis)));

    // Throw exception if no permissions and manage the result
    if (availableSis.length == 0) {
      throw { message: 'GestSIS Mobile non disponible avec votre compte' };
    }

    // Update state
    state.data.pseudo = pseudo;
    state.data.accessToken = accessToken;
    state.data.refreshToken = refreshToken;
    state.data.sis = availableSis;
    state.data.permissions = filteredPermissions;
    state.data.statut = UserStatus.connected;

    await persist();
  }

  /** Log in */
  const login = async (email: string, password: string) => {
    // Login request
    const { accessToken, refreshToken } = await AuthService.login({
      email,
      password,
    });

    // const userId = user.id;
    await setTokens(accessToken, refreshToken);

    // Select first sis;
    const res = selectSis(state.data.sis[0]);
    if (!res){
      throw "Vous n'avez pas les droits requis pour utiliser cette application";
    }

    // Set access token
    Api.setTokens(accessToken, refreshToken);

    // Load data
    const store = useStore();
    store.syncAll();

    return Promise.resolve();
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
    Api.setSisKey('');
    activePermissions.value = [];
    activeSisKey.value = '';
    persist();
  };

  const isLoggedIn = () => {
    return state.data.statut == UserStatus.connected;
  };

  return {
    state,
    isLoggedIn,
    login,
    logout,
    selectSis,
    setTokens,
    persist,
    activeSisKey,
    activePermissions,
  };
}
