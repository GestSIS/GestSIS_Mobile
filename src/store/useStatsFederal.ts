import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { StatFederal } from '@/models/bundle';
import StatFederalService from '@/services/StatFederalService';

export interface State {
  liste: StatFederal[];
}
const state: State = reactive({ liste: [] });

export default function useStatsFederal() {
  const name = "Statistiques fédérales";
  const store = useBasicStore(
    state,
    StatFederalService.getStats,
    'stat-federal'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
