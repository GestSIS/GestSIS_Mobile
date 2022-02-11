import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { StatFederal } from '@/models/bundle';
import StatFederalService from '@/services/StatFederalService';

const state: Ref<StatFederal[]> = ref([]);
const store = useBasicStore(
  state,
  StatFederalService.getStats,
  'stat-federal'
);

export default function useStatsFederal() {
  const name = "Statistiques fédérales";

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
