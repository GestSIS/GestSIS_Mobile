import Api from "../http/Request.ts";
import type { Vehicule } from "../models/vehicule.ts";

export default {
  getVehicules(): Promise<Vehicule[]> {
    return Api.api().get("/vehicules");
  },
};
