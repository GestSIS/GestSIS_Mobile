import Api from "../http/Request.ts";
import type { Sapeur } from "../models/sapeur.ts";

export default {
  getSapeurs(): Promise<Sapeur[]> {
    return Api.api().get("/sapeurs");
  },
};
