import Api from "../http/Request";
import type { Exercice } from "../models/exercice";
import type { EventType } from "../models/event-type";
import type { Materiel } from "../models/materiel";

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
