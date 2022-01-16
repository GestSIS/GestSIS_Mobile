import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Sapeur } from '@/models/bundle';
import SapeurService from '@/services/SapeurService';

export interface State {
  liste: Sapeur[];
}
const state: State = reactive({ liste: [] });

export default function useSapeurs() {
  const name = "Sapeurs";
  const store = useBasicStore(
    state,
    SapeurService.getSapeurs,
    'sapeurs'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
