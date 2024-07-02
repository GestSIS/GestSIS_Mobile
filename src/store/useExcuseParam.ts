import { ExcuseParam } from "./../models/excuseparam";
import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore";
import ExcuseParamService from "../services/ExcuseParamService";

const state: Ref<ExcuseParam[]> = ref([]);
const store = useBasicStore(
  state,
  ExcuseParamService.getParams,
  "excuse-param"
);

export default function useExcuseTypes() {
  const name = "Excuse param";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "exercice.presence",
  };
}
