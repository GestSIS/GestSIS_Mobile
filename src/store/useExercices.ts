import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Exercice } from '@/models/bundle';
import ExerciceService from '@/services/ExerciceService';

export interface State {
  liste: Exercice[];
}
const state: State = reactive({ liste: [] });

export default function useExexercices() {
  const name = "Exercices";
  const store = useBasicStore(
    state,
    ExerciceService.getExercices,
    'exercices'
  );

  return {
    ...store,  
    name,
    state//: readonly(state),
  };
}
