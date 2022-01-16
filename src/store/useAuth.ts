import { reactive } from 'vue';
import { usePersistentStore } from './usePersistentStore';
import useStore from './useStore';

const { persistentStore } = usePersistentStore();
const store = useStore()

export enum UserStatus {
  disconnected,
  connected,
}

export interface User {
  name: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  statut: UserStatus;
  permissions: string[];
}

const emptyState = {
  name: null,
  email: null,
  accessToken: null,
  refreshToken: null,
  statut: UserStatus.disconnected,
  permissions: [],
};

const state: { data: User } = reactive({ data : { ...emptyState } });

const persistKey = 'auth'

export default function useAuth() {
  /** Persist data in local storage */
  const login = async (username: string, password: string) => {
    //TODO: Login request
    persistentStore.set(persistKey, state);
  };

  /** Reset local storage */
  const logout = () => {
    store.reset();
    state.data = { ...emptyState };
  };

  const isLoggedIn = () => {
    return state.data.statut == UserStatus.connected;
  }

  /** Load data from local storage */
  const init = async () => {
    const data = await persistentStore.get(persistKey);
    state.data = data || { ...emptyState };
  };

  init();

  return {
    state,
    isLoggedIn,
    login,
    logout
  };
}
