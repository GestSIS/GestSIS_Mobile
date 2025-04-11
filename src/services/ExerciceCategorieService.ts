import Api from "../http/Request";
import type { ExerciceCategorie } from "../models/exercicecategorie";

export default {
  getCategories(): Promise<ExerciceCategorie[]> {
    return Api.api().get("/exercice-categories");
  },
};
