import Api from "../http/Request";
import type { MaterielIntervention } from "../models/materiel-intervention";

export default {
  getMateriels(): Promise<MaterielIntervention[]> {
    return Api.api().get("/materiels");
  },
};
