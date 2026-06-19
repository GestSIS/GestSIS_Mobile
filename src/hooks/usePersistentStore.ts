import * as CordovaSQLiteDriver from "localforage-cordovasqlitedriver";
import { Storage, Drivers } from "@ionic/storage";

const persistentStore = new Storage({
  driverOrder: [
    CordovaSQLiteDriver._driver,
    Drivers.IndexedDB,
    Drivers.LocalStorage,
  ],
});
const storageReady = persistentStore.create();

export function usePersistentStore() {
  return { persistentStore, storageReady };
}
