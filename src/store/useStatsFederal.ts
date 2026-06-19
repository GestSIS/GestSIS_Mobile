import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { StatFederal } from "../models/statfederal.ts";
import StatFederalService from "../services/StatFederalService.ts";

const state: Ref<StatFederal[]> = ref([]);
const store = useBasicStore(state, StatFederalService.getStats, "stat-federal");

export default function useStatsFederal() {
  const name = "Statistiques fédérales";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
