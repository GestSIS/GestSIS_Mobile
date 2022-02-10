import { reactive, readonly } from 'vue';
import InterventionService from '@/services/InterventionService';
import { Intervention } from '@/models/intervention';
import { v4 as uuidv4 } from 'uuid';
import useBasicStore, { StoreState } from './useBasicStore';
import { DateTime } from 'luxon';

export interface State {
  liste: Intervention[];
}
const state: State = reactive({ liste: [] });
const persistKey = 'interventions';

export default function useInterventions() {
  const name = 'Interventions';
  const store = useBasicStore(state, InterventionService.getInterventions, 'interventions');

  /** Load data from GestSIS API */
  const load = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    //TODO: Do not override new and in sync intervention
    const interventions = await InterventionService.getInterventions();
    //TODO: Generate random uuid for each intervention
    state.liste = interventions.map((i) => ({ ...i, localUuid: 'null' }));

    store.lastSync.value = DateTime.now().toISO();
    store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  const newIntervention = (
    date: DateTime,
    objet: string,
    localite_id: number,
    adresse: string
  ): Intervention => {
    const intervention = new Intervention();
    intervention.localUuid = uuidv4();
    intervention.en_creation = true;
    intervention.date_debut = date.toISO();
    intervention.lieu = adresse;
    intervention.objet = objet;

    intervention.nb_animaux_sauves = 0;
    intervention.nb_personnes_sauvees = 0;

    intervention.type_intervention_id = null as any;
    intervention.stat_federal_id = null as any;
    intervention.localite_id = localite_id;
    intervention.sapeur_id = null as any;

    state.liste.push(intervention);
    store.persist();
    return intervention;
  };

  const updateIntervention = (intervention: Intervention) => {
    state.liste = state.liste.map((i) =>
      i.localUuid === intervention.localUuid ? intervention : i
    );
  };

  return {
    ...store,
    name,
    state,
    load,
    updateIntervention,
    newIntervention,
  };
}
