import { readonly, Ref, ref } from "vue";
import useBasicStore, { StoreState } from "./useBasicStore";
import AlarmeService from "@/services/AlarmeService";
import { Alarme } from "@/models/alarme";
import { DateTime } from "luxon";

const state: Ref<Alarme[]> = ref([]);
const store = useBasicStore(state, AlarmeService.fetchAlarmes, "localites");

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
