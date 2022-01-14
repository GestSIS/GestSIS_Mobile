import { ExerciceCategorie } from "@/models/bundle";

export interface State {
  liste: ExerciceCategorie[];
}

export const state: State = {
  liste: [],
};