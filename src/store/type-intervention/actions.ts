import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import TypeInterventionService from "@/services/TypeInterventionService";

export enum Actions {
  FETCH_TYPE_INTERVENTIONS = "FETCH_TYPE_INTERVENTIONS"
}

export interface ActionsType {
  [Actions.FETCH_TYPE_INTERVENTIONS](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_TYPE_INTERVENTIONS]({ commit }) {
  return TypeInterventionService.getTypes().then((data) =>
      commit(Mutations.UPDATE_TYPE_INTERVENTION_LISTE, data)
    );
  }
};