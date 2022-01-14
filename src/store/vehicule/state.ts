import { Vehicule } from "@/models/bundle";

export interface State {
  liste: Vehicule[];
}

export const state: State = {
  liste: [],
};