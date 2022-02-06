import { DateTime } from 'luxon';

import { ref } from 'vue';
import { usePersistentStore } from './usePersistentStore';

const { persistentStore } = usePersistentStore();
const lastSyncSuffixe = 'last_sync';

export enum StoreState {
  Synced,
  Syncing,
  NeedSync,
}

export default function useBasicStore<Type>(
  state: { liste: Type[] },
  loader: () => Promise<Type[]>,
  persistKey: string
) {
  const syncStatus = ref(StoreState.NeedSync);
  const lastSync = ref<string>('');

  /** Persist data in local storage */
  const persist = async () => {
    // Persists by using persistKey
    persistentStore.set(persistKey, JSON.stringify(state.liste));
    persistentStore.set(persistKey + lastSyncSuffixe, lastSync.value);
  };

  /** Reset local storage */
  const reset = () => {
    persistentStore.remove(persistKey);
    syncStatus.value = StoreState.NeedSync;
    lastSync.value = DateTime.now().toISO();
    state.liste = [];
  };

  /** Load data from local storage */
  const init = async () => {
    syncStatus.value = StoreState.Syncing;
    const data = await persistentStore.get(persistKey);
    state.liste = JSON.parse(data) || [];
    lastSync.value = (await persistentStore.get(persistKey + lastSyncSuffixe)) || null;
    syncStatus.value = StoreState.Synced;
  };

  /** Load data from GestSIS API */
  const load = async (): Promise<boolean> => {
    syncStatus.value = StoreState.Syncing;
    state.liste = await loader();
    lastSync.value = DateTime.now().toISO();
    persist();
    syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  init();

  return {
    syncStatus,
    lastSync,
    reset,
    persist,
    load,
  };
}
