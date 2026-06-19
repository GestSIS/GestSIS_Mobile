import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { Groupe } from "../models/groupe.ts";
import GroupeService from "../services/GroupeService.ts";

const state: Ref<Groupe[]> = ref([]);
const store = useBasicStore(state, GroupeService.getGroupes, "groupes");

export default function useGroupes() {
  const name = "Groupes";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
