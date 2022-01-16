import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { HeureExerciceType } from '@/models/heureexercicetype';
import ExerciceHeureTypeService from '@/services/ExerciceHeureTypeService';

export interface State {
  liste: HeureExerciceType[];
}
const state: State = reactive({ liste: [] });

export default function useHeureExerciceTypes() {
  const name = "Heures exercice types";
  const store = useBasicStore(
    state,
    ExerciceHeureTypeService.getHeuresTypes,
    'heure-exercice-types'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
