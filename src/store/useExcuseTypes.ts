import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { ExcuseType } from "../models/excusetype.ts";
import ExcuseTypeService from "../services/ExcuseTypeService.ts";

const state: Ref<ExcuseType[]> = ref([]);
const store = useBasicStore(
  state,
  ExcuseTypeService.getExcuses,
  "excuses-type",
);

export default function useExcuseTypes() {
  const name = "Excuses types";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "exercice.presence",
  };
}
