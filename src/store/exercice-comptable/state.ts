import { ExerciceComptable } from "@/models/bundle";

export interface State {
  liste: ExerciceComptable[];
}

export const state: State = {
  liste: [],
};