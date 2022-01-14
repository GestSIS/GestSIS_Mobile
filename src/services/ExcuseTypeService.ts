import Api from '@/http/Request';
import { ExcuseType } from '@/models/bundle';

export default {
  getExcuses(): Promise<ExcuseType[]> {
    return Api.api().get('/excuses-types');
  },
};
