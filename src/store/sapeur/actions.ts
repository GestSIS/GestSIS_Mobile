import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import SapeurService from "@/services/SapeurService";

export enum Actions {
  FETCH_SAPEURS = "FETCH_SAPEURS"
}

export interface ActionsType {
  [Actions.FETCH_SAPEURS](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_SAPEURS]({ commit }) {
  return SapeurService.getSapeurs().then((data) =>
      commit(Mutations.UPDATE_SAPEUR_LISTE, data)
    );
  }
};