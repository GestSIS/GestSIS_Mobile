import { Intervention } from "@/models/bundle";

export interface State {
  liste: Intervention[];
}

export const state: State = {
  liste: [],
};