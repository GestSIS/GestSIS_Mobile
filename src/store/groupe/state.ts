import { Groupe } from "@/models/bundle";

export interface State {
  liste: Groupe[];
}

export const state: State = {
  liste: [],
};