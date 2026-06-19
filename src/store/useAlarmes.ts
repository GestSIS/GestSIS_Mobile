import { type Ref, ref } from "vue";
import useBasicStore, { StoreState } from "./useBasicStore.ts";
import AlarmeService from "../services/AlarmeService.ts";
import type { Alarme } from "../models/alarme.ts";
import { DateTime } from "luxon";

const state: Ref<Alarme[]> = ref([]);
const store = useBasicStore(state, AlarmeService.fetchAlarmes, "alarmes");

export default function useAlarmes() {
  const name = "Alarmes";

  /** Load data from GestSIS API */
  const forcedSync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    state.value = await AlarmeService.fetchAlarmes(true);
    store.lastSync.value = DateTime.now().toSQL() ?? "";
    await store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  return {
    ...store,
    forcedSync,
    name,
    state: state,
  };
}
