import Api from "../http/Request.ts";
import type { Exercice } from "../models/exercice.ts";

export default {
  getExercices(): Promise<Exercice[]> {
    return Api.api().get("/exercices-derniers");
  },
  getExercice(id: number): Promise<Exercice> {
    return Api.api().get("/exercices/" + id);
  },
  createExercice(exerciceData: Exercice): Promise<Exercice> {
    return Api.api().post("/exercices", exerciceData);
  },
  updateExercicePresences(exercice: Exercice) {
    return Api.api().post("/exercices/" + exercice.id + "/presences", {
      sapeurs: exercice.sapeurs,
    });
  },
};
