import { MissionType } from "@/models/bundle";

export interface State {
  liste: MissionType[];
}

export const state: State = {
  liste: [],
};