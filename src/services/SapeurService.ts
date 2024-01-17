import Api from "@/http/Request";
import { Sapeur } from "@/models/sapeur";

export default {
  getSapeurs(): Promise<Sapeur[]> {
    return Api.api().get("/sapeurs?actif=true");
  },
};
