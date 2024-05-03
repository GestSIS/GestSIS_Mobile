import { readonly, type Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { TypeIntervention } from '../models/bundle';
import TypeInterventionService from '../services/TypeInterventionService';

const state: Ref<TypeIntervention[]> = ref([]);
const store = useBasicStore(
  state,
  TypeInterventionService.getTypes,
  'types-interventions'
);

export default function useTypesIntervention() {
  const name = "TypeInterventions";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: 'intervention.modification',
  };
}
