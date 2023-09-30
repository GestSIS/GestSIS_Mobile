import { ref } from "vue";

const activeTab = ref<"GROUPE" | "SAPEUR" | "QUITTANCE">("GROUPE");

export const usePresenceTab = () => {
  return {
    activeTab,
  };
};
