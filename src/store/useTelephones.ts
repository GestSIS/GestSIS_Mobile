import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Telephone } from '@/models/bundle';
import TelephoneService from '@/services/TelephoneService';

export interface State {
  liste: Telephone[];
}
const state: State = reactive({ liste: [] });

export default function useTelephones() {
  const name = "Téléphones";
  const store = useBasicStore(
    state,
    TelephoneService.getTelephones,
    'telephones'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
