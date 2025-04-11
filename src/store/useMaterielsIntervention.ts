import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore";
import type { MaterielIntervention } from "../models/materiel-intervention";
import MaterielInterventionService from "../services/MaterielInterventionService";

const state: Ref<MaterielIntervention[]> = ref([]);
const store = useBasicStore(
  state,
  MaterielInterventionService.getMateriels,
  "materiel-intervention"
);

export default function useMaterielsIntervention() {
  const name = "Matériel";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
