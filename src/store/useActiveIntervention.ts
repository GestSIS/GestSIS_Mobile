import { reactive, readonly } from 'vue';
import { Intervention } from '@/models/intervention';
import useInterventions from './useInterventions';

export interface State {
  activeIntervention: Intervention | null;
}
const state: State = reactive({ activeIntervention: null });
const persistKey = 'interventions';

export default function useActiveIntervention() {
  const reset = () => {
    state.activeIntervention = null;
  };
  const setActiveIntervention = (intervention: Intervention) => {
    state.activeIntervention = intervention;
  };
  const persist = () => {
    if (state.activeIntervention != null){
      const { updateIntervention, persist } = useInterventions();
      updateIntervention(state.activeIntervention);
      persist();
    }
  };

  return {
    state,
    reset,
    setActiveIntervention,
    persist,
  };
}
