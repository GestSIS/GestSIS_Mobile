<script lang="ts" setup>
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  alertController,
  IonItem,
  IonList,
  IonLabel,
  IonInput,
  IonIcon,
  IonFab,
  IonFabButton,
} from "@ionic/vue";

import type { Barcode } from "@capacitor-mlkit/barcode-scanning";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

import { ref, type Ref } from "vue";
import MaterielService from "../services/MaterielService";
import type { Materiel } from "../models/materiel";
import type { EventType } from "../models/event-type";

const online = window.navigator.onLine;
if (!online) {
  // TODO: Warning message to activate internet
}

let materiel: Materiel[] = [];
let types: EventType[] = [];

MaterielService.getMateriel().then(
  (data) => (materiel = [...data.filter((m) => m.materiel.uuid !== undefined)])
);
MaterielService.getEventsTypes().then((data) => (types = [...data]));

const isSupported = ref(false);
const barcodes: Ref<Barcode[]> = ref([]);

BarcodeScanner.isSupported().then((result) => {
  isSupported.value = result.supported;
});

const scan = async (): Promise<void> => {
  const granted = await requestPermissions();
  if (!granted) {
    presentAlert();
    return;
  }
  const scan = await BarcodeScanner.scan();
  barcodes.value.push(...scan.barcodes);
};

const requestPermissions = async (): Promise<boolean> => {
  const { camera } = await BarcodeScanner.requestPermissions();
  return camera === "granted" || camera === "limited";
};

const presentAlert = async (): Promise<void> => {
  const alert = await alertController.create({
    header: "Permissions manquantes",
    message:
      "Veuillez donner les permissions d'accès à la caméra pour scanner les code-barres.",
    buttons: ["OK"],
  });
  await alert.present();
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="{ name: 'accueil' }" />
        </ion-buttons>
        <ion-title>Matériel</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-title>Ajouter un événement</ion-title>

      <ion-list
        v-for="t in types"
        :key="t.id"
      >
        <ion-item>{{ t.nom }}</ion-item>
      </ion-list>
    </ion-content>
    <!-- {{ materiel.map((m) => m.materiel.numero) }} -->
    <ion-content>
      <ion-list>
        <ion-item
          v-for="barcode in barcodes"
          :key="barcode"
        >
          <ion-label position="stacked">
            {{ barcode.format }}
          </ion-label>
          <ion-input
            type="text"
            :value="barcode.rawValue"
          />
        </ion-item>
      </ion-list>
      <ion-fab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <ion-fab-button
          :disabled="!isSupported"
          @click="scan()"
        >
          <ion-icon name="scan" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
