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
    try {
      const data = await persistentStore.get(persistKey);
      // Guard against missing / empty / corrupted cached values:
      // JSON.parse(null/undefined/"") would throw and wedge the store.
      state.value = data ? JSON.parse(data) : [];
      lastSync.value =
        (await persistentStore.get(persistKey + lastSyncSuffixe)) || "";
      syncStatus.value = StoreState.Synced;
    } catch (e) {
      // Missing or corrupted local data: start empty and flag for resync.
      state.value = [];
      lastSync.value = "";
      syncStatus.value = StoreState.NeedSync;
    }
  };

  // Kick off loading cached data and expose the promise so sync()/callers
  // can await readiness instead of racing the fire-and-forget load.
  const ready = init();

  /** Load data from GestSIS API */
  const sync = async (): Promise<boolean> => {
    // Wait for the cached data to finish loading first; otherwise a late
    // init() could resolve after the fetch and clobber the synced data.
    await ready;
    syncStatus.value = StoreState.Syncing;
    state.value = await loader();
    lastSync.value = DateTime.now().toSQL() ?? "";
    await persist();
    syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  return {
    syncStatus,
    lastSync,
    permission: "",

    ready,
    reset,
    persist,
    sync,
  };
}
