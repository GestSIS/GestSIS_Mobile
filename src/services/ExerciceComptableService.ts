import Api from "../http/Request";
import type { ExerciceComptable } from "../models/exercicecomptable";

export default {
  getExercices(): Promise<ExerciceComptable[]> {
    return Api.api().get("/exercices-comptable");
  },
};
