import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { ExerciceComptable } from '@/models/exercicecomptable';
import ExerciceComptableService from '@/services/ExerciceComptableService';

export interface State {
  liste: ExerciceComptable[];
}
const state: State = reactive({ liste: [] });

export default function useExexercicesComptable() {
  const name = "Exercices comptable";
  const store = useBasicStore(
    state,
    ExerciceComptableService.getExercices,
    'exercices-comptable'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
