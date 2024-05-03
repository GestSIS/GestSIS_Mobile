import { readonly, type Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { ExerciceComptable } from '../models/exercicecomptable';
import ExerciceComptableService from '../services/ExerciceComptableService';

const state: Ref<ExerciceComptable[]> = ref([]);
const store = useBasicStore(
  state,
  ExerciceComptableService.getExercices,
  'exercices-comptable'
);

export default function useExexercicesComptable() {
  const name = "Exercices comptable";

  return {
    ...store,
    name,
    state: readonly(state),
  };
}
