import Api from "../http/Request.ts";
import type { Exercice } from "../models/exercice.ts";
import type { EventType } from "../models/event-type.ts";
import type { Materiel } from "../models/materiel.ts";

export default {
  getEventsTypes(): Promise<EventType[]> {
    return Api.api().get("/mat-perso-event-types");
  },
  getMateriel(): Promise<Materiel[]> {
    return Api.api().get("/mat-perso");
  },
  createEvent(exerciceData: Exercice): Promise<boolean> {
    return Api.api().post("/mat-perso-event", exerciceData);
  },
};
