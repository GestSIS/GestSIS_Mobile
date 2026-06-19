import Api from "../http/Request.ts";
import type { Alarme } from "../models/alarme.ts";

export default {
  fetchAlarmes(force = false): Promise<Alarme[]> {
    return Api.api().get("/alarmes?force=" + force);
  },
};
