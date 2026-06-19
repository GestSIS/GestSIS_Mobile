import { ref } from "vue";
import { usePersistentStore } from "../hooks/usePersistentStore.ts";
const { persistentStore, storageReady } = usePersistentStore();

const themeStoreKey = "local-theme";

const switchTheme = (mode: string) => {
  activeTheme.value = mode;
  persistentStore.set(themeStoreKey, mode);
  document.documentElement.classList.toggle(
    "ion-palette-dark",
    mode === "dark",
  );
};

const activeTheme = ref("light");

const init = async () => {
  // Wait for the storage driver before reading the stored theme, otherwise
  // get() can resolve to undefined before the DB is created.
  await storageReady;
  const value = await persistentStore.get(themeStoreKey);

  // Use matchMedia to check the user preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const preferedTheme = prefersDark ? "dark" : "light";

  let theme = value ?? preferedTheme;
  if (theme === "") {
    theme = preferedTheme;
  }

  switchTheme(theme);
};

init();

export function useTheme() {
  return { switchTheme, activeTheme };
}
