import { readonly, type Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { Localite } from '../models/localite';
import LocaliteService from '../services/LocaliteService';

const state: Ref<Localite[]> = ref([]);
const store = useBasicStore(
  state,
  LocaliteService.getLocalites,
  'localites'
);

export default function useLocalites() {
  const name = "Localités";

  return {
    ...store,
    name,
    state: readonly(state),
  };
}
