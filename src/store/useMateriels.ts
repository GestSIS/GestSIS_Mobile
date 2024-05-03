import { readonly, type Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { Materiel } from '../models/bundle';
import MaterielService from '../services/MaterielService';

const state: Ref<Materiel[]> = ref([]);
const store = useBasicStore(
  state,
  MaterielService.getMateriels,
  'materiel'
);

export default function useMateriels() {
  const name = "Matériel";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: 'intervention.modification',
  };
}
