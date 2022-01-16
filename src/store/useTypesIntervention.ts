import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { TypeIntervention } from '@/models/bundle';
import TypeInterventionService from '@/services/TypeInterventionService';

export interface State {
  liste: TypeIntervention[];
}
const state: State = reactive({ liste: [] });

export default function useTypesIntervention() {
  const name = "TypeInterventions";
  const store = useBasicStore(
    state,
    TypeInterventionService.getTypes,
    'types-interventions'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
