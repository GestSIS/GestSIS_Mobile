import Api from "../http/Request";
import type { Vehicule } from "../models/vehicule";

export default {
  getVehicules(): Promise<Vehicule[]> {
    return Api.api().get("/vehicules");
  },
};
