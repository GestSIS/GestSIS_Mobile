import Api from "../http/Request.ts";
import type { PhaseType } from "../models/phasetype.ts";

export default {
  getPhases(): Promise<PhaseType[]> {
    return Api.api().get("/phase-types");
  },
};
