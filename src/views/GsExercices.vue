<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'accueil' }"></ion-back-button>
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
          v-for="exercice in exercices"
          :key="exercice.id"
          @click="openDetails(exercice)"
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
import moment from "moment";
import { Exercice } from "@/models/exercice";

import { add } from "ionicons/icons";
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
  IonIcon,
} from "@ionic/vue";

export default {
  name: "GsExercices",
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonBackButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonIcon,
  },
  data() {
    const sortExercices = (exercices: Exercice[]): Exercice[] => {
      return exercices.sort((a, b) => moment(b.date).diff(a.date));
    };
    return {
      exercices: sortExercices([] as Exercice[]) as Exercice[],
      icons: {
        add,
      },
    };
  },
  methods: {
    formatDate(date: string) {
      return moment(date).format("DD.MM.yy HH:mm");
      //TODO: Check .format("dd.MM.yy HH:mm");
    },
    openDetails() {
      //_: Exercice) {
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