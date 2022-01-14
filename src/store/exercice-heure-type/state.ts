import { HeureExerciceType } from "@/models/bundle";

export interface State {
  liste: HeureExerciceType[];
}

export const state: State = {
  liste: [],
};