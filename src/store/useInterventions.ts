import { ref, Ref } from "vue";
import InterventionService from "@/services/InterventionService";
import { Intervention } from "@/models/intervention";
import { v4 as uuidv4 } from "uuid";
import useBasicStore, { StoreState } from "./useBasicStore";
import { DateTime } from "luxon";

const state: Ref<Intervention[]> = ref([]);
const store = useBasicStore(
  state,
  InterventionService.getInterventions,
  "interventions"
);

export default () => {
  const name = "Interventions";

  /** Load data from GestSIS API */
  const sync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    // Export validated interventions
    const interventions: Intervention[] = state.value.filter(
      (e) => e.localStatus == "validated"
    );
    await InterventionService.exportInterventions(interventions);

    // Manage errors and remove sync interventions
    state.value = state.value.filter((i) => i.localStatus != "validated");

    // For now, we do not offer the possibility to edit intervention
    store.lastSync.value = DateTime.now().toSQL() ?? "";
    await store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  const newIntervention = (
    date: DateTime,
    objet: string,
    localite_id: number,
    lieu: string
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
      state.value = state.value.map((i) =>
        i.localUuid == intervention.localUuid ? intervention : i
      );
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
