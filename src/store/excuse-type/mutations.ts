import { ExcuseType } from "@/models/bundle";
import { MutationTree, ActionContext } from "vuex";
import { IRootState } from "../interfaces";
import { State } from "./state";

export enum Mutations {
  CLEAR_CACHE = "CLEAR_CACHE",
  UPDATE_EXCUSE_TYPE_LISTE = "UPDATE_EXCUSE_TYPE_LISTE",
}

export type MutationsType<S = State> = {
  [Mutations.CLEAR_CACHE](state: S): void;
  [Mutations.UPDATE_EXCUSE_TYPE_LISTE](state: S, payload: ExcuseType[]): void;
};

export const mutations: MutationTree<State> & MutationsType = {
  [Mutations.CLEAR_CACHE](state: State) {
    state.liste = [];
  },
  [Mutations.UPDATE_EXCUSE_TYPE_LISTE](state: State, payload: ExcuseType[]) {
    state.liste = payload;
  }
};

export type AugmentedActionContext = {
  commit<K extends keyof MutationsType>(
    key: K,
    payload: Parameters<MutationsType[K]>[1]
  ): ReturnType<MutationsType[K]>;
  state: State;
} & Omit<ActionContext<State, IRootState>, "commit" | "state">
