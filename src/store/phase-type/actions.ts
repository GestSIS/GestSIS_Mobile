import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import PhaseTypeService from "@/services/PhaseTypeService";

export enum Actions {
  FETCH_PHASES = "FETCH_PHASES"
}

export interface ActionsType {
  [Actions.FETCH_PHASES](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_PHASES]({ commit }) {
  return PhaseTypeService.getPhases().then((data) =>
      commit(Mutations.UPDATE_PHASE_LISTE, data)
    );
  }
};