import Api from '@/http/Request';
import { UniteType } from '@/models/bundle';

export default {
  getUnites() : Promise<UniteType[]> {
    return Api.api().get('/unites');
  },
};
