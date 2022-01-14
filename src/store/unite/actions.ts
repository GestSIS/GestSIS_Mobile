import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import UniteService from "@/services/UniteService";

export enum Actions {
  FETCH_TYPE_UNITES = "FETCH_TYPE_UNITES"
}

export interface ActionsType {
  [Actions.FETCH_TYPE_UNITES](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_TYPE_UNITES]({ commit }) {
  return UniteService.getUnites().then((data) =>
      commit(Mutations.UPDATE_TYPE_UNITE_LISTE, data)
    );
  }
};