<script lang="ts" setup>
import { defineProps, ref, reactive } from "vue";
import {
  IonToolbar,
  IonIcon,
  IonLabel,
  IonText,
  IonModal,
  IonDatetime,
  IonInput,
  IonTitle,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from '@ionic/vue';

import { DateTime } from "luxon";
import useDateFormatter from "@/tools/useDateFormatter";
import BaseDatetime from "../base/BaseDatetime.vue";

const { formatDate } = useDateFormatter();

interface Presence {
  sapeur_id: null
  nom: string,
  prenom: string,
  date_debut: string,
  date_fin: string,
}

const props: Presence = defineProps<Presence>();
const presence = reactive({ ...props })

const dismiss = () => {
  modalController.dismiss(null);
}

const datetimeDebut = ref();
const datetimeFin = ref();

const openModalDebut = ref(false);
const openModalFin = ref(false);

const confirm = () => {
  if (datetimeFin.value === undefined) return;
  datetimeFin.value.$el.confirm();
  openModalFin.value = false;
};

const reset = () => {
  if (datetimeFin.value === undefined) return;

  datetimeFin.value.$el.reset();
  presence.date_fin = "";
  openModalFin.value = false;
};

const save = () => {
  modalController.dismiss(presence);
}

// const searchbar = ref<ComponentPublicInstance<HTMLInputElement>>();
// onMounted(() => {
//   searchbar.value?.$el.setFocus();
// })

const computeCurrentDate = (): DateTime => {
  // Défault à heure actuelle
  let date = DateTime.now();
  date = date.set({ minute: date.minute + 15 - (date.minute % 15), second: 0, millisecond: 0 });
  return date;
}
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
        <ion-input type="text" readonly="true" :value="presence.nom + ' ' + presence.prenom"></ion-input>
      </ion-item>

      <base-datetime
        :per-quarter="true"
        :max="presence.date_fin"
        v-model="presence.date_debut"
      >Heure d'arrivée</base-datetime>

      <base-datetime
        :per-quarter="true"
        :min="presence.date_debut"
        v-model="presence.date_fin"
        label="Heure de départ"
      >Heure de départ</base-datetime>
    </ion-list>
  </ion-content>
</template>

<style>
</style>