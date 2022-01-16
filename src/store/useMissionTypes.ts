import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { MissionType } from '@/models/bundle';
import MissionService from '@/services/MissionService';

export interface State {
  liste: MissionType[];
}
const state: State = reactive({ liste: [] });

export default function useMissionTypes() {
  const name = "Missions";
  const store = useBasicStore(
    state,
    MissionService.getMissions,
    'missions-types'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
