import Api from '@/http/Request';
import { TypeUnite } from '@/models/bundle';

export default {
  getUnites() : Promise<TypeUnite[]> {
    return Api.api().get('/unites');
  },
};
