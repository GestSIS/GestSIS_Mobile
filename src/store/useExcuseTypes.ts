import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { ExcuseType } from '@/models/excusetype';
import ExcuseTypeService from '@/services/ExcuseTypeService';

const state: Ref<ExcuseType[]> = ref([]);
const store = useBasicStore(
  state,
  ExcuseTypeService.getExcuses,
  'excuses-type'
);

export default function useExcuseTypes() {
  const name = 'Excuses types';

  return {
    ...store,
    name,
    state: readonly(state),
  };
}
