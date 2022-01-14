import { ActionTree } from "vuex";
import { Mutations } from "./mutations";
import { State } from "./state"
import { IRootState } from "../interfaces";

import { AugmentedActionContext } from "./mutations";
import TelephoneService from "@/services/TelephoneService";

export enum Actions {
  FETCH_TELEPHONES = "FETCH_TELEPHONES"
}

export interface ActionsType {
  [Actions.FETCH_TELEPHONES](
    { commit }: AugmentedActionContext
  ): void;
}

export const actions: ActionTree<State, IRootState> & ActionsType = {
  [Actions.FETCH_TELEPHONES]({ commit }) {
  return TelephoneService.getTelephones().then((data) =>
      commit(Mutations.UPDATE_TELEPHONE_LISTE, data)
    );
  }
};