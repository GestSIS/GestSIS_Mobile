import Api from "../http/Request.ts";
import type { TypeIntervention } from "../models/typeintervention.ts";

export default {
  getTypes(): Promise<TypeIntervention[]> {
    return Api.api().get("/type-intervention");
  },
};
