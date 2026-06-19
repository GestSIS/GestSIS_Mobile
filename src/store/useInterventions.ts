import { type Ref, ref } from "vue";
import InterventionService from "../services/InterventionService.ts";
import { Intervention } from "../models/intervention.ts";
import { v4 as uuidv4 } from "uuid";
import useBasicStore, { StoreState } from "./useBasicStore.ts";
import { DateTime } from "luxon";

const state: Ref<Intervention[]> = ref([]);
const store = useBasicStore(
  state,
  InterventionService.getInterventions,
  "interventions",
);

export default () => {
  const name = "Interventions";

  /** Load data from GestSIS API */
  const sync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    try {
      // Make sure cached interventions finished loading before we touch state.
      await store.ready;

      // Export validated interventions
      const interventions: Intervention[] = state.value.filter(
        (e) => e.localStatus == "validated",
      );
      const exportedUuids = new Set(
        await InterventionService.exportInterventions(interventions),
      );

      // Remove ONLY the interventions that were actually exported. Those that
      // failed stay queued for the next sync (no data loss); those that
      // succeeded are dropped so they are not re-sent and duplicated.
      state.value = state.value.filter(
        (i) => !exportedUuids.has(i.localUuid ?? ""),
      );

      store.lastSync.value = DateTime.now().toSQL() ?? "";
      await store.persist();

      const allExported = exportedUuids.size >= interventions.length;
      store.syncStatus.value = allExported
        ? StoreState.Synced
        : StoreState.NeedSync;
      return allExported;
    } catch (e) {
      // Never leave the store stuck on "Syncing" when the export throws.
      store.syncStatus.value = StoreState.NeedSync;
      throw e;
    }
  };

  const newIntervention = (
    date: DateTime,
    objet: string,
    localite_id: number,
    lieu: string,
  ): Intervention => {
    const intervention = new Intervention();
    intervention.localUuid = uuidv4();
    intervention.localStatus = "in_progress";
    intervention.date_debut =
      date.toSQL({ includeOffset: false })?.slice(0, 16) ?? "";
    intervention.lieu = lieu;
    intervention.objet = objet;

    intervention.type_intervention_id = null as any;
    intervention.stat_federal_id = null as any;
    intervention.localite_id = localite_id;
    intervention.sapeur_id = null as any;

    intervention.materiel = {};
    intervention.vehicules = [];

    state.value.push(intervention);
    store.persist();
    return intervention;
  };

  const updateIntervention = (intervention: Intervention): Intervention => {
    if (!intervention.localUuid && !intervention.id) {
      // Create intervention if no localUuid
      intervention.localUuid = uuidv4();
      intervention.localStatus = "in_progress";

      state.value.push(intervention);
    } else {
      // Match on localUuid when present, otherwise on id. Matching on an
      // undefined localUuid would replace every intervention lacking one
      // (e.g. all interventions loaded from the API).
      state.value = state.value.map((i) => {
        const isMatch = intervention.localUuid
          ? i.localUuid == intervention.localUuid
          : i.id == intervention.id;
        return isMatch ? intervention : i;
      });
    }
    store.persist();
    return intervention;
  };

  const removeIntervention = (uuid: string) => {
    state.value = state.value.filter((i) => i.localUuid != uuid);
    store.persist();
  };

  return {
    ...store,
    name,
    state,
    permission: "intervention.modification",

    sync,
    newIntervention,
    updateIntervention,
    removeIntervention,
  };
};
