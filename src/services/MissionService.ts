import Api from "../http/Request.ts";
import type { MissionType } from "../models/missiontype.ts";

export default {
  getMissions(): Promise<MissionType[]> {
    return Api.api().get("/mission-types");
  },
};
