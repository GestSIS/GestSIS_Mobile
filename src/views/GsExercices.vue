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
      </ion-button>-->

      <ion-list>
        <ion-item v-if="!exercices.length">Aucun exercice</ion-item>
        <ion-item
          tappable
          v-for="exercice in exercices"
          :key="exercice.id"
          @click="openDetails(exercice)"
        >
          <ion-icon slot="start" :name="exercice.en_creation ? 'create' : 'sync'"></ion-icon>
          <p>
            <!-- TODO: See if display can be improved -->
            <!-- {{ exercice.communication != '-' ? exercice.communication : exercice.categorie }} -->
            {{ exercice.description }} –
            {{ formatDate(exercice.date_debut) }}
            <br />
            <span class="details statut">
              {{
                exercice.en_creation
                  ? "En cours d'édition"
                  : "Validé, en attente de synchronisation"
              }}
            </span>
            <br />
            <span class="details">
              {{ getFormattedLocalite(exercice.localite_id) }} -
              {{ getFormattedCategorie(exercice.exercice_categorie_id) }}
            </span>
          </p>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import moment from "moment";
import { Exercice } from "@/models/bundle";

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

import { Localite, ExerciceCategorie, ExcuseType } from "@/models/bundle";
import { computed } from "vue";
import useExercices from "@/store/useExercices";
import useExcuseTypes from "@/store/useExcuseTypes";
import useLocalites from "@/store/useLocalites";
import useExerciceCategories from "@/store/useExerciceCategories";
import { useRouter } from "vue-router";

const exercicesStore = useExercices()
const categoriesStore = useExerciceCategories()
const excusesStore = useExcuseTypes()
const localitesStore = useLocalites()

const sortExercices = (exercices: Exercice[]): Exercice[] => {
  return exercices.slice(0).sort((a, b) => moment(b.date).diff(a.date));
};
const exercices = computed(() => sortExercices(exercicesStore.state.liste));

const categories: readonly ExerciceCategorie[] = categoriesStore.state.liste;
const excuses: readonly ExcuseType[] = excusesStore.state.liste;
const localites: readonly Localite[] = localitesStore.state.liste;

const getFormattedLocalite = (localiteId: number) =>
  localites.find((l) => l.id == localiteId)?.designation;
const getFormattedCategorie = (categorieid: number) =>
  categories.find((c) => c.id == categorieid)?.designation;

const formatDate = (date: string) => {
  return moment(date).format("DD.MM.yy HH:mm");
  //TODO: Check .format("dd.MM.yy HH:mm");
};

const router = useRouter();
const openDetails = () => {
  //_: Exercice) {
  router.push('exercice');
};
const create = () => {
  //TODO:
};
</script>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
.statut {
}
</style>