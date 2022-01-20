<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'accueil' }"></ion-back-button>
        </ion-buttons>
        <ion-title>Rapports d'intervention</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-button expand="full" @click="create()">
        <ion-icon slot="start" name="add"></ion-icon>
        Nouveau
      </ion-button>

      <ion-list>
        <ion-item v-if="!interventions.length"
          >Aucun rapport d'intervention</ion-item
        >
        <ion-item
          tappable
          v-for="intervention in interventions"
          :key="intervention.id"
          @click="openDetails(intervention)"
        >
          <ion-icon
            slot="start"
            :name="intervention.en_creation ? 'create' : 'sync'"
          ></ion-icon>
          {{ intervention.objet }} –
          {{ formatDate(intervention.date_debut, "DD.MM.yy HH:mm") }}
          <p>
            {{
              intervention.en_creation
                ? "En cours d'édition"
                : "Validé, en attente de synchronisation"
            }}
          </p>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import useInterventions from "@/store/useInterventions";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
} from "@ionic/vue";

import { computed } from "vue";
import useDateFormatter from "@/tools/useDateFormater";
const { formatDate } = useDateFormatter();

const storeInterventions = useInterventions();
const interventions = computed(() => storeInterventions.state.liste);

const openDetails = () => {
  //intervention: Intervention) {
  //TODO:
};
const create = () => {
  //TODO:
};
</script>

<style scoped>
</style>