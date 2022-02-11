import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { Sapeur } from '@/models/bundle';
import SapeurService from '@/services/SapeurService';

const state: Ref<Sapeur[]> = ref([]);
const store = useBasicStore(
  state,
  SapeurService.getSapeurs,
  'sapeurs'
);

export default function useSapeurs() {
  const name = "Sapeurs";

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
