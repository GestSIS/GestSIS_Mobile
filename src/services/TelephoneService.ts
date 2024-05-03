import Api from '../http/Request';
import { Telephone } from '../models/telephone';

export default {
  getTelephones(): Promise<Telephone[]> {
    return Api.api().get('/telephones');
  },
};
