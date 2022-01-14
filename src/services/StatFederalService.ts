import Api from '@/http/Request';
import { StatFederal } from '@/models/statfederal';

export default {
  getStats() : Promise<StatFederal[]>{
    return Api.api().get('/stat-federal');
  },
};
