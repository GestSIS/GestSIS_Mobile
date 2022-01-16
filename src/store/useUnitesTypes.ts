import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { UniteType } from '@/models/bundle';
import UniteService from '@/services/UniteService';

export interface State {
  liste: UniteType[];
}
const state: State = reactive({ liste: [] });

export default function useUnitesType() {
  const name = "Unités";
  const store = useBasicStore(
    state,
    UniteService.getUnites,
    'unite-types'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
