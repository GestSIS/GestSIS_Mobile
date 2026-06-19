import type { PhaseType } from "../models/phasetype.ts";
import PhaseTypeService from "../services/PhaseTypeService.ts";
import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";

const state: Ref<PhaseType[]> = ref([]);
const store = useBasicStore(state, PhaseTypeService.getPhases, "phases-types");

export default function usePhaseTypes() {
  const name = "Phases";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
