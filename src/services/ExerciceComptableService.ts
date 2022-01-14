import Api from '@/http/Request';
import { ExerciceComptable } from '@/models/bundle';

export default {
  getExercices(): Promise<ExerciceComptable[]> {
    return Api.api().get('/exercices-comptable');
  },
};
