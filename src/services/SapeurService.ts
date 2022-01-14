import Api from '@/http/Request';
import { Sapeur } from '@/models/sapeur';

export default {
  //TODO: Nouvelle API pour récupérer données sapeurs
  getSapeurs() : Promise<Sapeur[]> {
    return Api.api().get('/sapeurs');
  },
};
