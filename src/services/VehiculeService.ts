import Api from '../http/Request';
import { Vehicule } from '../models/bundle';

export default {
  getVehicules(): Promise<Vehicule[]> {
    return Api.api().get('/vehicules');
  },
};
