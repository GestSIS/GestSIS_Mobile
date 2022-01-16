import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { ExcuseType } from '@/models/excusetype';
import ExcuseTypeService from '@/services/ExcuseTypeService';

export interface State {
  liste: ExcuseType[];
}
const state: State = reactive({ liste: [] });

export default function useExcuseTypes() {
  const name = "Excuses types";
  const store = useBasicStore(
    state,
    ExcuseTypeService.getExcuses,
    'excuses-type'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
