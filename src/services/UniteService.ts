import Api from "../http/Request";
import type { UniteType } from "../models/unitetype";

export default {
  getUnites(): Promise<UniteType[]> {
    return Api.api().get("/unites");
  },
};
