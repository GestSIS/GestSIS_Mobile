import Api from "../http/Request.ts";
import type { MaterielIntervention } from "../models/materiel-intervention.ts";

export default {
  getMateriels(): Promise<MaterielIntervention[]> {
    return Api.api().get("/materiels");
  },
};
