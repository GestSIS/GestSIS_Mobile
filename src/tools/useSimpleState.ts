import { ref } from "vue";

export default () => {
  const state = ref<any>("");
  return { state }
}