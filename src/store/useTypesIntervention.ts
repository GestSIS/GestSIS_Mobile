import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { TypeIntervention } from "../models/typeintervention.ts";
import TypeInterventionService from "../services/TypeInterventionService.ts";

const state: Ref<TypeIntervention[]> = ref([]);
const store = useBasicStore(state, TypeInterventionService.getTypes, "types-interventions");

export default function useTypesIntervention() {
  const name = "Type d'interventions";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
