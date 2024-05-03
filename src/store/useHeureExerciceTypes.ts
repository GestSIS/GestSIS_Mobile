import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { HeureExerciceType } from '../models/heureexercicetype';
import ExerciceHeureTypeService from '../services/ExerciceHeureTypeService';

const state: Ref<HeureExerciceType[]> = ref([]);
const store = useBasicStore(
  state,
  ExerciceHeureTypeService.getHeuresTypes,
  'heure-exercice-types'
);

export default function useHeureExerciceTypes() {
  const name = "Heures exercice types";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: 'exercice.presence',
  };
}
