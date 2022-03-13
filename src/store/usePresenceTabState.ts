import { ref } from "vue";

const activeTab = ref<"GROUPE"|"SAPEUR">("GROUPE");

export const usePresenceTab = () => {
  return {
    activeTab
  }
} 