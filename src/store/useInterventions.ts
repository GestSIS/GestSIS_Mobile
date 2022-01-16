import { reactive, readonly } from "vue";
import InterventionService from "@/services/InterventionService";
import { Intervention } from "@/models/intervention";

export interface State {
  liste: Intervention[]
}
const state: State = reactive({liste:[]});
const persistKey = 'interventions'

export default function useInterventions(){
  const reset = () => {
    state.liste = [];
  }
  const load = async() => {
    //TODO: Do not override new and in sync intervention
    const interventions = await InterventionService.getInterventions();
    //TODO: Generate random uuid for each intervention
    state.liste = interventions.map((i) => ({...i, localUuid : "null" }));
  }
  const newIntervention = (intervention: Intervention): Intervention => {
    intervention.localUuid = "null";
    state.liste.push(intervention);
    return intervention;
  }
  const updateIntervention = (intervention: Intervention)=> {
    state.liste = state.liste.map(i => i.localUuid === intervention.localUuid ? intervention : i)
  }
  const persist = async() => {
    //TODO: Persist data
    persistKey
  }
  const sync = async() => {
    //TODO: sync data with GestSIS
    // If success for now, clear all interventions
  }

  return{
    state: readonly(state),
    updateIntervention,
    newIntervention,
    reset,
    load,
    persist,
    sync
  }
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
