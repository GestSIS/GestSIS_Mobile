import { TypeIntervention } from "@/models/bundle";

export interface State {
  liste: TypeIntervention[];
}

export const state: State = {
  liste: [],
};