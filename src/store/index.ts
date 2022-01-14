import { ExcuseType } from '@/models/excusetype';
import { Exercice } from '@/models/exercice';
import { ExerciceCategorie } from '@/models/exercicecategorie';
import { Groupe } from '@/models/groupe';
import { HeureExerciceType } from '@/models/heureexercicetype';
import { Intervention } from '@/models/intervention';
import { Localite } from '@/models/localite';
import { Materiel } from '@/models/materiel';
import { Mission } from '@/models/mission';
import { Phase } from '@/models/phase';
import { Sapeur } from '@/models/sapeur';
import { StatFederal } from '@/models/statfederal';
import { Telephone } from '@/models/telephone';
import { TypeIntervention } from '@/models/typeintervention';
import { TypeUnite } from '@/models/type';
import { Vehicule } from '@/models/vehicule';

import { createStore, useStore as baseUseStore } from 'vuex';

// interfaces for our State and todos
export interface State {
  exercices: Exercice[];
  interventions: Intervention[];
  sapeurs: Sapeur[];
  localites: Localite[],
  groupes: Groupe[],
  unites: TypeUnite[],
  
  // Specific to exercices
  exerciceCategories: ExerciceCategorie[],
  excusesType: ExcuseType[],
  heureExerciceTypes: HeureExerciceType[],

  // Specific to intervention
  missions: Mission[],
  telephones: Telephone[],
  statFederal: StatFederal[],
  typeIntervention: TypeIntervention[],
  materiels: Materiel[],
  vehicules: Vehicule[],
  phases: Phase[],
}

const state: State = {
  exercices: [{
    id: 1,
    date: "2022-02-01",
    heure: "12:00",
    en_creation : false,
    local : false,
    complet : false,
    lieu: "Hangar",
    communications: "Tenu feu",
    description: "Exercice PR 1",
    duree: 120,
    statut: 1,
    exercice_categorie_id: 1,
    localite_id: 1,
    presences_completees: false,
    sapeurs: [],
  },{
    id: 1,
    date: "2022-02-01",
    heure: "12:00",
    en_creation : true,
    local : true,
    complet : false,
    lieu: "Hangar",
    communications: "Tenu feu",
    description: "Exercice PR 1",
    duree: 120,
    statut: 1,
    exercice_categorie_id: 1,
    localite_id: 1,
    presences_completees: false,
    sapeurs: [],
  },{
    id: 1,
    date: "2022-02-01",
    heure: "12:00",
    en_creation : true,
    local : false,
    complet : false,
    lieu: "Hangar",
    communications: "Tenu feu",
    description: "Exercice PR 1",
    duree: 120,
    statut: 1,
    exercice_categorie_id: 1,
    localite_id: 1,
    presences_completees: false,
    sapeurs: [],
  }],
  interventions: [],
  sapeurs: [],
  localites: [{
    id: 1,
    npa: "2855",
    designation: "Glovelier",
  }],
  groupes: [],
  unites: [],

  // Specific to exercices
  exerciceCategories: [{
    id: 1,
    designation: "Exercice",
    amendable: true,
    duree_base: 120,
    statut: 1,
    tri: 1,
}],
  excusesType: [],
  heureExerciceTypes: [],

  // Specific to intervention
  missions: [],
  telephones: [],
  statFederal: [],
  typeIntervention: [],
  materiels: [],
  vehicules: [],
  phases: [],
};


import { IRootState } from "@/store/interfaces";
import { CounterStoreModuleTypes } from "./interventions/types";

export const store = createStore<IRootState>({});

type StoreModules = {
  counter: CounterStoreModuleTypes;
};

export type Store = CounterStoreModuleTypes<Pick<StoreModules, "counter">>;

// our own `useStore` composition function for types
export function useStore() {
  return baseUseStore() as Store;
}