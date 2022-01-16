import { PhaseType } from '@/models/phasetype';
import PhaseTypeService from '@/services/PhaseTypeService';
import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';

export interface State {
  liste: PhaseType[];
}
const state: State = reactive({ liste: [] });

export default function usePhaseTypes() {
  const name = "Physes";
  const store = useBasicStore(
    state,
    PhaseTypeService.getPhases,
    'phases-types'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
