import Api from '@/http/Request';
import { TypeIntervention } from '@/models/typeintervention';

export default {
  getTypes() : Promise<TypeIntervention[]> {
    return Api.api().get('/type-intervention');
  },
};
