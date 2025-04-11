import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore";
import type { UniteType } from "../models/unitetype";
import UniteService from "../services/UniteService";

const state: Ref<UniteType[]> = ref([]);
const store = useBasicStore(state, UniteService.getUnites, "unite-types");

export default function useUnitesType() {
  const name = "Unités";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
