import { ref, Ref } from 'vue';
import InterventionService from '@/services/InterventionService';
import { Intervention } from '@/models/intervention';
import { v4 as uuidv4 } from 'uuid';
import useBasicStore, { StoreState } from './useBasicStore';
import { DateTime } from 'luxon';

const state: Ref<Intervention[]> = ref([]);
const store = useBasicStore(
  state,
  InterventionService.getInterventions,
  'interventions'
);

export default () => {
  const name = 'Interventions';

  /** Load data from GestSIS API */
  const sync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;

    // TODO: Load local interventions validated
    const interventions: any[] = [];
    // Export interventions
    const res = interventions.map((i) => {
      // TODO: Export single intervention

      // FIXME: Require update of api to handle easy export of intervention

      return { ok: true, uuid: i.localUuid };
    });

    //TODO: For now, we should not load any intervention
    // //TODO: Do not override new and in sync intervention
    // const interventions = await InterventionService.getInterventions();
    // //TODO: Generate random uuid for each intervention
    // state.value = interventions.map((i) => ({ ...i, localUuid: 'null' }));

    store.lastSync.value = DateTime.now().toISO();
    store.persist();
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
    intervention.en_creation = true;
    intervention.date_debut = date.toSQL({ includeOffset: false }).slice(0, 16);
    intervention.lieu = lieu;
    intervention.objet = objet;

    intervention.nb_animaux_sauves = 0;
    intervention.nb_personnes_sauvees = 0;

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

  const updateIntervention = (intervention: Intervention) => {
    state.value = state.value.map((i) =>
      i.localUuid == intervention.localUuid ? intervention : i
    );
    console.log('Persiste inter');
    store.persist();
  };

  const removeIntervention = (uuid: string) => {
    state.value = state.value.filter((i) => i.localUuid != uuid);
    store.persist();
  };

  return {
    ...store,
    name,
    state,
    sync,
    newIntervention,
    updateIntervention,
    removeIntervention,
  };
};
