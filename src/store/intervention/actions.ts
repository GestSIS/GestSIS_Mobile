import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import InterventionService from "@/services/InterventionService";

export enum Actions {
  FETCH_INTERVENTIONS = "FETCH_INTERVENTIONS"
}

export interface ActionsType {
  [Actions.FETCH_INTERVENTIONS](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_INTERVENTIONS]({ commit }) {
  return InterventionService.getInterventions().then((data) =>
      commit(Mutations.UPDATE_INTERVENTION_LISTE, data)
    );
  }
};