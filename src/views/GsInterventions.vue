<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
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
          v-for="(i, intervention) in interventions"
          :key="intervention.id"
          @click="openDetails(i)"
        >
          <ion-icon
            slot="start"
            :name="intervention.en_creation ? 'create' : 'sync'"
          ></ion-icon>
          {{ intervention.objet }} –
          {{ formatDate(intervention.date_debut) }}
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

<script lang="ts">
import { add } from "ionicons/icons";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
} from "@ionic/vue";

export default {
  name: "GsInterventions",
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
  },
  data() {
    return {
      interventions: [],
      icons: {
        add,
      },
    };
  },
  methods: {
    formatDate(date: string) {
      return new Date(date).toLocaleDateString();
      //TODO: Check .format("dd.MM.yy HH:mm");
    },
    openDetails(i: number) {
      //TODO:
    },
    create() {
      //TODO:
    },
  },
};
</script>

<style scoped>
</style>