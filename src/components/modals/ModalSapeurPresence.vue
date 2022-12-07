<script lang="ts" setup>
import { defineProps, reactive } from "vue";
import {
  IonToolbar,
  IonIcon,
  IonLabel,
  IonInput,
  IonTitle,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from "@ionic/vue";

import BaseDatetime from "../base/BaseDatetime.vue";

interface Presence {
  sapeur_id: null;
  nom: string;
  prenom: string;
  date_debut: string;
  date_fin: string;
}

const props: Presence = defineProps<Presence>();
const presence = reactive({ ...props });

const dismiss = () => {
  modalController.dismiss(null);
};

const save = () => {
  modalController.dismiss(presence);
};

// const searchbar = ref<ComponentPublicInstance<HTMLInputElement>>();
// onMounted(() => {
//   searchbar.value?.$el.setFocus();
// })
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="dismiss()">
          <ion-icon name="arrow-back"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Détails d'une présence</ion-title>

      <ion-buttons slot="end">
        <ion-button @click="save()">Enregistrer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list>
      <ion-item>
        <ion-label fixed>Sapeur</ion-label>
        <ion-input
          type="text"
          :readonly="true"
          :value="presence.nom + ' ' + presence.prenom"
        ></ion-input>
      </ion-item>

      <base-datetime
        :per-quarter="true"
        :max="presence.date_fin"
        v-model="presence.date_debut"
        >Heure d'arrivée</base-datetime
      >

      <base-datetime
        :per-quarter="true"
        :min="presence.date_debut"
        v-model="presence.date_fin"
        label="Heure de départ"
        >Heure de départ</base-datetime
      >
    </ion-list>
  </ion-content>
</template>

<style></style>
