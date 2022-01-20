import { ref } from 'vue';
import { usePersistentStore } from './usePersistentStore';

const { persistentStore } = usePersistentStore();
const lastSyncSuffixe = 'last_sync';

export default function useBasicStore<Type>(
  state: { liste: Type[] },
  loader: () => Promise<Type[]>,
  persistKey: string
) {
  const lastSync = ref<Date|null>(null);

  /** Persist data in local storage */
  const persist = async () => {
    // Persists by using persistKey
    persistentStore.set(persistKey, JSON.stringify(state.liste));
    lastSync.value = new Date();
    persistentStore.set(persistKey+lastSyncSuffixe, lastSync.value);
  };

  /** Reset local storage */
  const reset = () => {
    persistentStore.remove(persistKey);
    state.liste = [];
  };

  /** Load data from local storage */
  const init = async () => {
    const data = await persistentStore.get(persistKey);
    state.liste = JSON.parse(data) || [];
    lastSync.value = await persistentStore.get(persistKey+lastSyncSuffixe)
  };
  
  /** Load data from GestSIS API */
  const load = async (): Promise<boolean> => {
    state.liste = await loader();
    persist();
    return Promise.resolve(true);
  };

  init();

  return {
    reset,
    persist,
    load,
  };
}
