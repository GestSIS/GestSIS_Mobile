<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Exercices</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- <ion-button expand="full" @click="create()">
        <ion-icon slot="start" name="add"></ion-icon>
        Nouveau
      </ion-button> -->

      <ion-list>
        <ion-item v-if="!exercices.length">Aucun exercice</ion-item>
        <ion-item
          tappable
          v-for="(i, exercice) in exercices"
          :key="exercice.id"
          @click="openDetails(i)"
        >
          <ion-icon
            slot="start"
            :name="exercice.en_creation ? 'create' : 'sync'"
          ></ion-icon>
          {{ exercice.objet }} –
          {{ formatDate(exercice.date_debut) }}
          <p>
            {{
              exercice.en_creation
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
  IonIcon,
} from "@ionic/vue";

export default {
  name: "GsExercices",
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
    IonIcon,
  },
  data() {
    return {
      exercices: [],
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