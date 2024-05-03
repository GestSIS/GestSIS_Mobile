import { readonly, type Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { MissionType } from '../models/bundle';
import MissionService from '../services/MissionService';

const state: Ref<MissionType[]> = ref([]);
const store = useBasicStore(
  state,
  MissionService.getMissions,
  'missions-types'
);

export default function useMissionTypes() {
  const name = "Missions";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: 'intervention.modification',
  };
}
