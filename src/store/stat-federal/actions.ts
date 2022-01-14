import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import StatFederalService from "@/services/StatFederalService";

export enum Actions {
  FETCH_STAT_FEDERALS = "FETCH_STAT_FEDERALS"
}

export interface ActionsType {
  [Actions.FETCH_STAT_FEDERALS](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_STAT_FEDERALS]({ commit }) {
  return StatFederalService.getStats().then((data) =>
      commit(Mutations.UPDATE_STAT_FEDERAL_LISTE, data)
    );
  }
};