import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { Localite } from "../models/localite.ts";
import LocaliteService from "../services/LocaliteService.ts";

const state: Ref<Localite[]> = ref([]);
const store = useBasicStore(state, LocaliteService.getLocalites, "localites");

export default function useLocalites() {
  const name = "Localités";

  return {
    ...store,
    name,
    state: readonly(state),
  };
}
