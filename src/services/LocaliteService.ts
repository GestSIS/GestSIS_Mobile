import Api from "../http/Request.ts";
import type { Localite } from "../models/localite.ts";

export default {
  getLocalites(): Promise<Localite[]> {
    return Api.api().get("/localites");
  },
  getLocalitesSis(): Promise<number[]> {
    return Api.api().get("/localites-sis");
  },
};
