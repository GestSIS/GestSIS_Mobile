import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import LocaliteService from "@/services/LocaliteService";

export enum Actions {
  FETCH_LOCALITES = "FETCH_LOCALITES"
}

export interface ActionsType {
  [Actions.FETCH_LOCALITES](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_LOCALITES]({ commit }) {
  return LocaliteService.getLocalites().then((data) =>
      commit(Mutations.UPDATE_LOCALITE_LISTE, data)
    );
  }
};