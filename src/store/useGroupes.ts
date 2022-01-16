import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Groupe } from '@/models/groupe';
import GroupeService from '@/services/GroupeService';

export interface State {
  liste: Groupe[];
}
const state: State = reactive({ liste: [] });

export default function useGroupes() {
  const name = "Groupes";
  const store = useBasicStore(
    state,
    GroupeService.getGroupes,
    'groupes'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
