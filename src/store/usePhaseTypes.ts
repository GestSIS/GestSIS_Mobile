import { PhaseType } from '../models/phasetype';
import PhaseTypeService from '@/services/PhaseTypeService';
import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';

const state: Ref<PhaseType[]> = ref([]);
const store = useBasicStore(
  state,
  PhaseTypeService.getPhases,
  'phases-types'
);

export default function usePhaseTypes() {
  const name = "Phases";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: 'intervention.modification',
  };
}
