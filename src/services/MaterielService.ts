import Api from '../http/Request';
import { Materiel } from '../models/materiel';

export default {
  getMateriels(): Promise<Materiel[]> {
    return Api.api().get('/materiels');
  },
};
