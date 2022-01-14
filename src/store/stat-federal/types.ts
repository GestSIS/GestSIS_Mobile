import { State } from "./state"
import { MutationsType } from "./mutations"
import { ActionsType } from "./actions";

import { Store as VuexStore, CommitOptions, DispatchOptions } from "vuex";

export type StoreModuleType<S = State> = Omit<VuexStore<S>,
  "commit" | "getters" | "dispatch"
> & {
  commit<
    K extends keyof MutationsType,
    P extends Parameters<MutationsType[K]>[1]
  >(
    key: K,
    payload?: P,
    options?: CommitOptions
  ): ReturnType<MutationsType[K]>;
} & {
  dispatch<K extends keyof ActionsType>(
    key: K,
    payload?: Parameters<ActionsType[K]>[1],
    options?: DispatchOptions
  ): ReturnType<ActionsType[K]>;
};