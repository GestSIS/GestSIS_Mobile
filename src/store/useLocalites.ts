import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Localite } from '@/models/localite';
import LocaliteService from '@/services/LocaliteService';

export interface State {
  liste: Localite[];
}
const state: State = reactive({ liste: [] });

export default function useLocalites() {
  const name = "Localités";
  const store = useBasicStore(
    state,
    LocaliteService.getLocalites,
    'localites'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
