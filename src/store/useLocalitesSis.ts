import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import LocaliteService from '@/services/LocaliteService';

const state: Ref<number[]> = ref([]);
const store = useBasicStore(
  state,
  LocaliteService.getLocalitesSis,
  'localites'
);

export default function useLocalites() {
  const name = "Localités du sis";

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
