import Api from "../http/Request.ts";
import type { ExerciceCategorie } from "../models/exercicecategorie.ts";

export default {
  getCategories(): Promise<ExerciceCategorie[]> {
    return Api.api().get("/exercice-categories");
  },
};
