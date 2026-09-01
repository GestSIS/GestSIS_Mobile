import { ref } from "vue";
import { App } from "@capacitor/app";
import AppVersionService from "../services/AppVersionService.ts";

const updateAvailable = ref(false);
const latestVersion = ref<string | null>(null);
const currentVersion = ref<string | null>(null);

function isNewerVersion(current: string, latest: string): boolean {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] ?? 0;
    const latestPart = latestParts[i] ?? 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}

// App.getInfo() is unavailable in a plain browser (web dev server): fall
// back to the version baked in at build time from package.json.
const loadCurrentVersion = async () => {
  try {
    const { version } = await App.getInfo();
    currentVersion.value = version;
  } catch {
    currentVersion.value = __APP_VERSION__;
  }
};

// The backend call can fail (offline, backend down): fetched independently
// from the current version so that a network error doesn't discard a
// version we did manage to determine locally.
const checkForUpdate = async () => {
  await loadCurrentVersion();

  let latest: string | null = null;
  try {
    ({ version: latest } = await AppVersionService.getLatestVersion());
  } catch {
    // Nothing to show: no known latest version.
  }
  latestVersion.value = latest;

  updateAvailable.value =
    !!latest && isNewerVersion(currentVersion.value as string, latest);
};

export function useAppUpdate() {
  return {
    updateAvailable,
    latestVersion,
    currentVersion,
    checkForUpdate,
    loadCurrentVersion,
  };
}
