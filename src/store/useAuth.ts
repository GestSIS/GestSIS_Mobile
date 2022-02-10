import AuthService from '@/services/AuthService';
import { reactive, ref } from 'vue';
import { usePersistentStore } from './usePersistentStore';
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

const state: { data: User } = reactive({ data: { ...emptyState } });
const activeSisKey = ref<string>('');
const activePermissions = ref<string[]>([]);
const lastSync = ref<Date | null>(null);

const persistKey = 'auth';
const lastSyncSuffixe = 'last_sync';

const selectSis = (sisKey: string) => {
  if (!sisKey || !(sisKey in state.data.permissions)) {
    console.error("seems invalid key :"+sisKey)
    return;
  }
  activePermissions.value = state.data.permissions[sisKey];
  activeSisKey.value = sisKey;
  Api.setSisKey(sisKey);
  console.log('Set sis-key' + sisKey);
};

/** Load data from local storage */
const init = async () => {
  const data = await persistentStore.get(persistKey);
  state.data = JSON.parse(data) || { ...emptyState };
  lastSync.value = await persistentStore.get(persistKey + lastSyncSuffixe);

  if (state.data.accessToken != null) {
    Api.setTokens(state.data.accessToken, state.data.refreshToken);
    const sisKeys = Object.keys(state.data.permissions);
    selectSis(sisKeys[0]);
  }
};

init();

export default function useAuth() {
  /** Log in */
  const login = async (email: string, password: string) => {
    // Login request
    const { accessToken, refreshToken, user } = await AuthService.login({
      email,
      password,
    });
    
    const userId = user.id;
    const { permissions, pseudo } = (jwt_decode(accessToken) as any).data;
    const availableSis = Object.keys(permissions);
    
    // TODO: Throw exception if no permissions
    if (availableSis.length == 0) {
      throw { message: 'Aucune permission' };
    }

    // Update state
    state.data.email = email;
    state.data.pseudo = pseudo;
    state.data.accessToken = accessToken;
    state.data.refreshToken = refreshToken;
    state.data.sis = availableSis;
    state.data.permissions = permissions;
    state.data.statut = UserStatus.connected;

    // Select first sis;
    selectSis(availableSis[0]);

    // Set access token
    Api.setTokens(accessToken, refreshToken);
    await persist();

    // Load data
    const store = useStore();
    store.loadAll();

    return Promise.resolve();
  };

  /** Persist data in local storage */
  const persist = async () => {
    persistentStore.set(persistKey, JSON.stringify(state.data));
    lastSync.value = new Date();
    persistentStore.set(persistKey + lastSyncSuffixe, lastSync.value);
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
    persist,
    activeSisKey,
    activePermissions,
  };
}
