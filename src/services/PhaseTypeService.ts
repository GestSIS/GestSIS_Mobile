import Api from '@/http/Request';
import { PhaseType } from '@/models/phasetype';

export default {
  getPhases(): Promise<PhaseType[]> {
    return Api.api().get('/phase-types');
  },
};
