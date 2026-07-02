import { Storage, Drivers } from "@ionic/storage";

const persistentStore = new Storage({
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});
const storageReady = persistentStore.create();

export function usePersistentStore() {
  return { persistentStore, storageReady };
}
