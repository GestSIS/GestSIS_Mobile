import { usePersistentStore } from './usePersistentStore';

const { persistentStore } = usePersistentStore();

export default function useBasicStore<Type>(
  state: { liste: Type[] },
  loader: () => Promise<Type[]>,
  persistKey: string
) {
  /** Persist data in local storage */
  const persist = async() => {
    // Persists by using persistKey
    persistentStore.set(persistKey, state.liste)
  };

  /** Reset local storage */
  const reset = () => {
    persistentStore.remove(persistKey)
    state.liste = [];
  };

  /** Load data from local storage */
  const init = async() => {
    const data = await persistentStore.get(persistKey);
    state.liste = data || [];
  };

  /** Load data from GestSIS API */
  const load = async () => {
    state.liste = await loader();
    persist();
  };

  init();

  return {
    reset,
    persist,
    load,
  };
}
