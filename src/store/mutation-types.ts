import { MutationTypes as interventionTypes } from "./interventions/mutation-types";

export enum commonMutations  {
  CLEAR_CACHE = "CLEAR_CACHE",
}

export const AllMutationTypes = {...interventionTypes };