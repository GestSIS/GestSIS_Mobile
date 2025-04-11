import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore";
import type { ExerciceCategorie } from "../models/exercicecategorie";
import ExerciceCategorieService from "../services/ExerciceCategorieService";

const state: Ref<ExerciceCategorie[]> = ref([]);
const store = useBasicStore(
  state,
  ExerciceCategorieService.getCategories,
  "exerciceCategorie"
);

export default function useExerciceCategories() {
  const name = "Catégories d'exercices";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "exercice.presence",
  };
}
