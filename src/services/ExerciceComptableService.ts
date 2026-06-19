import Api from "../http/Request.ts";
import type { ExerciceComptable } from "../models/exercicecomptable.ts";

export default {
  getExercices(): Promise<ExerciceComptable[]> {
    return Api.api().get("/exercices-comptable");
  },
};
