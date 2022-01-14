import Api from '@/http/Request';
import { Phase } from '@/models/phase';

export default {
  getPhases(): Promise<Phase[]> {
    return Api.api().get('/phase-types');
  },
};
