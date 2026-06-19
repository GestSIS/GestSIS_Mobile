import Api from "../http/Request.ts";
import type { Telephone } from "../models/telephone.ts";

export default {
  getTelephones(): Promise<Telephone[]> {
    return Api.api().get("/telephones");
  },
};
