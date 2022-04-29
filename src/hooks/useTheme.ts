import { ref } from "vue";
import { usePersistentStore } from "../hooks/usePersistentStore"
const { persistentStore } = usePersistentStore()

const themeStoreKey = "local-theme";

const switchTheme = (mode: string) => {
  activeTheme.value = mode;
  persistentStore.set(themeStoreKey, mode)
  document.body.classList.toggle('dark', mode === "dark");
}

const activeTheme = ref("light");

const init = () => {
  persistentStore.get(themeStoreKey).then(value => {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const preferedTheme = prefersDark ? "dark" : "light";

    let theme = value ?? preferedTheme;
    if (theme === "") {
      theme = preferedTheme;
    }
    
    switchTheme(theme);
  })
}

init()

export function useTheme(){
  return { switchTheme, activeTheme }
}
