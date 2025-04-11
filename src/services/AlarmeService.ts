import Api from "../http/Request";
import type { Alarme } from "../models/alarme";

export default {
  fetchAlarmes(force = false): Promise<Alarme[]> {
    return Api.api().get("/alarmes?force=" + force);
  },
};
