import Api from "../http/Request.ts";
import type { UniteType } from "../models/unitetype.ts";

export default {
  getUnites(): Promise<UniteType[]> {
    return Api.api().get("/unites");
  },
};
