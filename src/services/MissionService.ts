import Api from '@/http/Request';
import { MissionType } from '@/models/missiontype';

export default {
  getMissions(): Promise<MissionType[]> {
    return Api.api().get('/mission-types');
  },
};
