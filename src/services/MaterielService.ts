import Api from "../http/Request";
import { Exercice } from "../models/bundle";
import type { EventType } from "../models/event-type";
import type { Materiel } from "../models/materiel";

export default {
  getEventsTypes(): Promise<EventType[]> {
    return Api.api().get("/mat-perso-event-types");
  },
  getMateriel(): Promise<Materiel[]> {
    return Api.api().get("/mat-perso");
  },
  createEvent(exerciceData: Exercice): Promise<Boolean> {
    return Api.api().post("/mat-perso-event", exerciceData);
  },
};
