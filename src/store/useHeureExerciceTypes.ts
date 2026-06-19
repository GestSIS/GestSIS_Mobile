import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { HeureExerciceType } from "../models/heureexercicetype.ts";
import ExerciceHeureTypeService from "../services/ExerciceHeureTypeService.ts";

const state: Ref<HeureExerciceType[]> = ref([]);
const store = useBasicStore(
  state,
  ExerciceHeureTypeService.getHeuresTypes,
  "heure-exercice-types",
);

export default function useHeureExerciceTypes() {
  const name = "Heures exercice types";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "exercice.presence",
  };
}
