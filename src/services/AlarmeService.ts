import Api from '@/http/Request';
import { Alarme } from '@/models/bundle';

export default {
  fetchAlarmes(force = false): Promise<Alarme[]> {
    return Api.api().get('/alarmes?force=' + force);
  },
};
