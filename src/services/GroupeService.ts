import Api from "../http/Request.ts";
import type { Groupe } from "../models/groupe.ts";

export default {
  getGroupes(): Promise<Groupe[]> {
    return Api.api().get("/groupes");
  },
};
