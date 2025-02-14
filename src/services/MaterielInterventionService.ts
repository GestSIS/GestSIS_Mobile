import Api from '../http/Request';
import { MaterielIntervention } from '../models/materiel-intervention';

export default {
  getMateriels(): Promise<MaterielIntervention[]> {
    return Api.api().get('/materiels');
  },
};
