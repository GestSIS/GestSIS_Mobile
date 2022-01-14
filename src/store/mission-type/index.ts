import { Module } from "vuex";
import { IRootState } from "../interfaces";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { State, state } from "./state";

// Module
const module: Module<State, IRootState> = {
  state,
  mutations,
  actions
};

export default module;