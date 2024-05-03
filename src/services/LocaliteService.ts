import Api from '../http/Request';
import { Localite } from '../models/localite';

export default {
  getLocalites(): Promise<Localite[]> {
    return Api.api().get('/localites');
  },
  getLocalitesSis(): Promise<number[]> {
    return Api.api().get('/localites-sis');
  },
};
