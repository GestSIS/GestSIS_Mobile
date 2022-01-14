import { ExcuseType } from "@/models/bundle";

export interface State {
  liste: ExcuseType[];
}

export const state: State = {
  liste: [],
};