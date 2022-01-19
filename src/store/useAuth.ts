import AuthService from '@/services/AuthService';
import { reactive } from 'vue';
import { usePersistentStore } from './usePersistentStore';
import useStore from './useStore';
import Api from '@/http/Request';
import jwt_decode from 'jwt-decode';

const { persistentStore } = usePersistentStore();
const store = useStore();

export enum UserStatus {
  disconnected,
  connected,
}

export interface User {
  pseudo: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  statut: UserStatus;
  permissions: string[];
  sis: any[];
}

const emptyState = {
  pseudo: null,
  email: null,
  accessToken: null,
  refreshToken: null,
  statut: UserStatus.disconnected,
  permissions: [],
  sis: []
};

const state: { data: User } = reactive({ data: { ...emptyState } });

const persistKey = 'auth';

export default function useAuth() {
  /** Persist data in local storage */
  const login = async (email: string, password: string) => {
    //TODO: Login request
    const { accessToken, refreshToken, user } = await AuthService.login({
      email,
      password,
    });

    const userId = user.id;
    const { permissions, pseudo } = (jwt_decode(accessToken) as any).data;
    const availableSis = Object.keys(permissions);

    state.data.email = email;
    state.data.pseudo = pseudo;
    state.data.accessToken = accessToken;
    state.data.refreshToken = refreshToken;
    state.data.sis = availableSis;
    state.data.statut = UserStatus.connected;

    Api.setAccessToken(accessToken);
    persistentStore.set(persistKey, JSON.stringify(state));
    return Promise.resolve();
  };

  /** Reset local storage */
  const logout = () => {
    store.reset();
    state.data = { ...emptyState };
  };

  const isLoggedIn = () => {
    return state.data.statut == UserStatus.connected;
  };

  /** Load data from local storage */
  const init = async () => {
    const data = await persistentStore.get(persistKey);
    state.data = JSON.parse(data) || { ...emptyState };
  };

  init();

  return {
    state,
    isLoggedIn,
    login,
    logout,
  };
}
