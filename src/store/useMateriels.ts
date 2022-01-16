import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Materiel } from '@/models/bundle';
import MaterielService from '@/services/MaterielService';

export interface State {
  liste: Materiel[];
}
const state: State = reactive({ liste: [] });

export default function useMateriels() {
  const name = "Matériel";
  const store = useBasicStore(
    state,
    MaterielService.getMateriels,
    'materiel'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
