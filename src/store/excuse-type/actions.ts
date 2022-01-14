import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import ExcuseTypeService from "@/services/ExcuseTypeService";

export enum Actions {
  FETCH_EXCUSES = "FETCH_EXCUSES"
}

export interface ActionsType {
  [Actions.FETCH_EXCUSES](
    { commit }: AugmentedActionContext,
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_EXCUSES]({ commit }) {
    return ExcuseTypeService.getExcuses().then((data) =>
      commit(Mutations.UPDATE_EXCUSE_TYPE_LISTE, data)
    );
  }
};