import Api from '../http/Request';
import { HeureExerciceType } from '../models/bundle';

export default {
  getHeuresTypes(): Promise<HeureExerciceType[]> {
    return Api.api().get('/heure-exercice-types');
  },
};
