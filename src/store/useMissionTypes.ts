import { readonly, type Ref, ref } from "vue";
import useBasicStore from "./useBasicStore.ts";
import type { MissionType } from "../models/missiontype.ts";
import MissionService from "../services/MissionService.ts";

const state: Ref<MissionType[]> = ref([]);
const store = useBasicStore(
  state,
  MissionService.getMissions,
  "missions-types",
);

export default function useMissionTypes() {
  const name = "Missions";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: "intervention.modification",
  };
}
