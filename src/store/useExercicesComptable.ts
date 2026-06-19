import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { ExerciceComptable } from "../models/exercicecomptable.ts";
import ExerciceComptableService from "../services/ExerciceComptableService.ts";

const state: Ref<ExerciceComptable[]> = ref([]);
const store = useBasicStore(
  state,
  ExerciceComptableService.getExercices,
  "exercices-comptable",
);

export default function useExexercicesComptable() {
  const name = "Exercices comptable";

  return {
    ...store,
    name,
    state: readonly(state),
  };
}
