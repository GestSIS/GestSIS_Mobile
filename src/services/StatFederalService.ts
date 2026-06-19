import Api from "../http/Request.ts";
import type { StatFederal } from "../models/statfederal.ts";

export default {
  getStats(): Promise<StatFederal[]> {
    return Api.api().get("/stat-federal");
  },
};
