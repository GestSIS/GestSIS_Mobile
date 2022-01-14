import { Telephone } from "@/models/bundle";

export interface State {
  liste: Telephone[];
}

export const state: State = {
  liste: [],
};