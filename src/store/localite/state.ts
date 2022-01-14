import { Localite } from "@/models/bundle";

export interface State {
  liste: Localite[];
}

export const state: State = {
  liste: [],
};