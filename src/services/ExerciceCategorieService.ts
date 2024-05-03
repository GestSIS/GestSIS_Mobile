import Api from '../http/Request';
import { ExerciceCategorie } from '../models/bundle';

export default {
  getCategories(): Promise<ExerciceCategorie[]> {
    return Api.api().get('/exercice-categories');
  },
};
