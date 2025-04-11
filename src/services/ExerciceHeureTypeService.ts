import Api from "../http/Request";
import type { HeureExerciceType } from "../models/heureexercicetype";

export default {
  getHeuresTypes(): Promise<HeureExerciceType[]> {
    return Api.api().get("/heure-exercice-types");
  },
};
