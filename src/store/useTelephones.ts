import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { Telephone } from "../models/telephone.ts";
import TelephoneService from "../services/TelephoneService.ts";

const state: Ref<Telephone[]> = ref([]);
const store = useBasicStore(
  state,
  TelephoneService.getTelephones,
  "telephones",
);

export default function useTelephones() {
  const name = "Téléphones";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
