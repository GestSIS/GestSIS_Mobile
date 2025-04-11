import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore";
import type { Sapeur } from "../models/sapeur";
import SapeurService from "../services/SapeurService";

const state: Ref<Sapeur[]> = ref([]);
const store = useBasicStore(state, SapeurService.getSapeurs, "sapeurs");

export default function useSapeurs() {
  const name = "Sapeurs";

  return {
    ...store,
    name,
    state: readonly(state),
  };
}
