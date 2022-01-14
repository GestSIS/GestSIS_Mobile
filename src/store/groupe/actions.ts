import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import GroupeService from "@/services/GroupeService";

export enum Actions {
  FETCH_GROUPES = "FETCH_GROUPES"
}

export interface ActionsType {
  [Actions.FETCH_GROUPES](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_GROUPES]({ commit }) {
  return GroupeService.getGroupes().then((data) =>
      commit(Mutations.UPDATE_GROUPE_LISTE, data)
    );
  }
};