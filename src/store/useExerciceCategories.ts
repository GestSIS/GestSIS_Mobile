import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { ExerciceCategorie } from '@/models/exercicecategorie';
import ExerciceCategorieService from '@/services/ExerciceCategorieService';

export interface State {
  liste: ExerciceCategorie[];
}
const state: State = reactive({ liste: [] });

export default function useExerciceCategories() {
  const name = "Catégories d'exercices";
  const store = useBasicStore(
    state,
    ExerciceCategorieService.getCategories,
    'exerciceCategorie'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
