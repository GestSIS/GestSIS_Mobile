import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import ExerciceHeureTypeService from "@/services/ExerciceHeureTypeService";

export enum Actions {
  FETCH_EXERCICE_HEURE_TYPES = "FETCH_EXERCICE_HEURE_TYPES"
}

export interface ActionsType {
  [Actions.FETCH_EXERCICE_HEURE_TYPES](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_EXERCICE_HEURE_TYPES]({ commit }) {
  return ExerciceHeureTypeService.getHeuresTypes().then((data) =>
      commit(Mutations.UPDATE_HEURE_EXERCICE_TYPE_LISTE, data)
    );
  }
};