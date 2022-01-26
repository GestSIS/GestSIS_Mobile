import Api from '@/http/Request';
import { Exercice, PresenceExercice } from '@/models/bundle';

export default {
  // TODO: Nouvelle api pour simplifier la gestion des présences ???
  getExercices():Promise<Exercice[]> {
    // TODO: Nouvelle API pour les exercices
    return Api.api().get('/exercices-derniers');
  },
  createExercice(exerciceData: Exercice): Promise<Exercice> {
    return Api.api().post('/exercices', exerciceData);
  },
  addSapeurs(exercieId: number, sapeursData: any): Promise<PresenceExercice> {
    return Api.api().post('/exercices/' + exercieId + '/sapeurs', sapeursData);
  },
  editSapeurs(exercieId: number, sapeursData: any): Promise<PresenceExercice> {
    return Api.api().put('/exercices/' + exercieId + '/sapeurs', sapeursData);
  },
  removeSapeurs(exercieId: number, sapeursIds: number[]) {
    return Api.api().delete('/exercices/' + exercieId + '/sapeurs', {
      data: sapeursIds,
    });
  },
};
