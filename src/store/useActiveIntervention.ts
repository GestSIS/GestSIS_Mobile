import { reactive, readonly } from 'vue';
import { Intervention } from '@/models/intervention';
import useInterventions from './useInterventions';

export interface State {
  activeIntervention: Intervention;
}
const state: State = reactive({ activeIntervention: new Intervention() });
const persistKey = 'interventions';

export default function useActiveIntervention() {
  const reset = () => {
    state.activeIntervention = new Intervention();
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
    state: state.activeIntervention,
    reset,
    setActiveIntervention,
    persist,
  };
}
