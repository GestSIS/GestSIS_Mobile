<script lang="ts" setup>
import { defineProps } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from "@ionic/vue";
import { Alarme } from "@/models/alarme";

const props = defineProps<{ alarme: Alarme }>();

const dismiss = () => {
  modalController.dismiss(null);
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Quittances</ion-title>
      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list>
      <ion-item> EM : </ion-item>
      <ion-item v-for="sapeur of props.alarme.firefighters" :key="sapeur.id">
        {{ sapeur }}
      </ion-item>
      <ion-item v-for="(sapeur, index) of props.alarme.unresolved" :key="index">
        {{ sapeur }}
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style></style>
