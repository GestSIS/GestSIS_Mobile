import Api from '../http/Request';
import { Groupe } from '../models/groupe';

export default {
  getGroupes(): Promise<Groupe[]> {
    return Api.api().get('/groupes');
  },
};
