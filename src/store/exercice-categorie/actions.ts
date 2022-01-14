import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import ExerciceCategorieService from "@/services/ExerciceCategorieService";

export enum Actions {
  FETCH_EXERCICE_CATEGORIES = "FETCH_EXERCICE_CATEGORIES"
}

export interface ActionsType {
  [Actions.FETCH_EXERCICE_CATEGORIES](
    { commit }: AugmentedActionContext,
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_EXERCICE_CATEGORIES]({ commit }) {
    return ExerciceCategorieService.getCategories().then((data) =>
      commit(Mutations.UPDATE_EXERCICE_CATEGORIE, data)
    );
  }
};