import Api from "../http/Request.ts";
import type { HeureExerciceType } from "../models/heureexercicetype.ts";

export default {
  getHeuresTypes(): Promise<HeureExerciceType[]> {
    return Api.api().get("/heure-exercice-types");
  },
};
