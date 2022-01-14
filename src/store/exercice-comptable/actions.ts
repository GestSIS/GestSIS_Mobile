import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import ExcuseTypeService from "@/services/ExcuseTypeService";
import { ExerciceComptable } from "@/models/bundle";

export enum Actions {
  FETCH_EXERCICES_COMPTABLE = "FETCH_EXERCICES_COMPTABLE"
}

export interface ActionsType {
  [Actions.FETCH_EXERCICES_COMPTABLE](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_EXERCICES_COMPTABLE]({ commit }) {
  return ExcuseTypeService.getExcuses().then((data) =>
      commit(Mutations.UPDATE_EXERCICE_COMPTABLE_LISTE, data as unknown as ExerciceComptable[])
    );
  }
};