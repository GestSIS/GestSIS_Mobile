import { DateTime } from "luxon";

import { type Ref, ref } from "vue";
import { usePersistentStore } from "../hooks/usePersistentStore";

const { persistentStore } = usePersistentStore();
const lastSyncSuffixe = "last_sync";

export enum StoreState {
  Synced,
  Syncing,
  NeedSync,
}

export default function useBasicStore<Type>(
  state: Ref<Type[]>,
  loader: () => Promise<Type[]>,
  persistKey: string
) {
  const syncStatus = ref(StoreState.NeedSync);
  const lastSync = ref<string>("");

  /** Persist data in local storage */
  const persist = async () => {
    // Persists by using persistKey
    await persistentStore.set(
      persistKey,
      JSON.stringify(state.value, (_key, value) =>
        value instanceof Set
          ? [...value]
          : value instanceof Map
            ? { ...value }
            : value
      )
    );
    await persistentStore.set(persistKey + lastSyncSuffixe, lastSync.value);
  };

  /** Reset local storage */
  const reset = () => {
    persistentStore.remove(persistKey);
    syncStatus.value = StoreState.NeedSync;
    lastSync.value = DateTime.now().toSQL() ?? "";
    state.value = [];
  };

  /** Load data from local storage */
  const init = async () => {
    syncStatus.value = StoreState.Syncing;
    const data = await persistentStore.get(persistKey);
    state.value = JSON.parse(data) || [];
    lastSync.value =
      (await persistentStore.get(persistKey + lastSyncSuffixe)) || null;
    syncStatus.value = StoreState.Synced;
  };

  /** Load data from GestSIS API */
  const sync = async (): Promise<boolean> => {
    syncStatus.value = StoreState.Syncing;
    state.value = await loader();
    lastSync.value = DateTime.now().toSQL() ?? "";
    await persist();
    syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  init();

  return {
    syncStatus,
    lastSync,
    permission: "",

    reset,
    persist,
    sync,
  };
}
