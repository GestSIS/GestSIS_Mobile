import { reactive, readonly } from 'vue';
import InterventionService from '@/services/InterventionService';
import { Intervention } from '@/models/intervention';
import { v4 as uuidv4 } from 'uuid';

export interface State {
  liste: Intervention[];
}
const state: State = reactive({ liste: [] });
const persistKey = 'interventions';

export default function useInterventions() {
  const name = 'Interventions';
  const reset = () => {
    state.liste = [];
  };

  const load = async () => {
    //TODO: Do not override new and in sync intervention
    const interventions = await InterventionService.getInterventions();
    //TODO: Generate random uuid for each intervention
    state.liste = interventions.map((i) => ({ ...i, localUuid: 'null' }));
  };

  const newIntervention = (date: Date, objet: string, localite_id: number, adresse: string): Intervention => {
    const intervention = new Intervention();
    intervention.localUuid = uuidv4();
    intervention.en_creation = true;
    intervention.date_debut = date;
    intervention.lieu = adresse;
    intervention.objet = objet;

    intervention.nb_animaux_sauves = 0;
    intervention.nb_personnes_sauvees = 0;

    intervention.type_intervention_id = null as any;
    intervention.stat_federal_id = null as any;
    intervention.localite_id = localite_id;
    intervention.sapeur_id = null as any;

    state.liste.push(intervention);
    return intervention;
  };

  const updateIntervention = (intervention: Intervention) => {
    state.liste = state.liste.map((i) =>
      i.localUuid === intervention.localUuid ? intervention : i
    );
  };

  const persist = async () => {
    //TODO: Persist interventions
    persistKey;
  };

  const sync = async () => {
    //TODO: sync data with GestSIS
    // If success for now, clear all interventions
  };

  return {
    state: state,
    name,
    updateIntervention,
    newIntervention,
    reset,
    load,
    persist,
    sync,
  };
}

// export interface State {
//   exercices: Exercice[];
//   interventions: Intervention[];
//   sapeurs: Sapeur[];
//   localites: Localite[],
//   groupes: Groupe[],
//   unites: TypeUnite[],

//   // Specific to exercices
//   exerciceCategories: ExerciceCategorie[],
//   excusesType: ExcuseType[],
//   heureExerciceTypes: HeureExerciceType[],

//   // Specific to intervention
//   missions: Mission[],
//   telephones: Telephone[],
//   statFederal: StatFederal[],
//   typeIntervention: TypeIntervention[],
//   materiels: Materiel[],
//   vehicules: Vehicule[],
//   phases: Phase[],
// }
