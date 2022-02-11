import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { Exercice } from '@/models/bundle';
import ExerciceService from '@/services/ExerciceService';

const state: Ref<Exercice[]> = ref([]);
const store = useBasicStore(state, ExerciceService.getExercices, 'exercices');

export default function useExexercices() {
  const name = 'Exercices';

  //TODO: Override load to prevent overriding existing exercices

  return {
    ...store,
    name,
    state, //: readonly(state),
  };
}
