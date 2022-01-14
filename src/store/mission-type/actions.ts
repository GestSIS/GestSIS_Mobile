import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import MissionService from "@/services/MissionService";

export enum Actions {
  FETCH_MISSIONS = "FETCH_MISSIONS"
}

export interface ActionsType {
  [Actions.FETCH_MISSIONS](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_MISSIONS]({ commit }) {
  return MissionService.getMissions().then((data) =>
      commit(Mutations.UPDATE_MISSION_LISTE, data)
    );
  }
};