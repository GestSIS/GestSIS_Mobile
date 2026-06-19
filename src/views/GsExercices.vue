<script lang="ts" setup>
import type { Exercice } from "../models/exercice.ts";

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
  loadingController,
} from "@ionic/vue";
import { create, warning, sync } from "ionicons/icons";

import { computed } from "vue";
import useExercices from "../store/useExercices.ts";
import useLocalites from "../store/useLocalites.ts";
import useExerciceCategories from "../store/useExerciceCategories.ts";
import useDateFormatter from "../tools/useDateFormatter.ts";
import useSapeurs from "../store/useSapeurs.ts";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";

const exercicesStore = useExercices();
const sapeursStore = useSapeurs();
const categoriesStore = useExerciceCategories();
const localitesStore = useLocalites();

const online = window.navigator.onLine;
if (online) {
  // Reload exercices and sapeurs
  exercicesStore.sync().catch();
  sapeursStore.sync().catch();
}

const sortExercices = (exercices: Exercice[]): Exercice[] => {
  return exercices
    .slice(0)
    .sort((a, b) =>
      DateTime.fromSQL(a.date).diff(DateTime.fromSQL(b.date)).toMillis(),
    );
};

const exercices = computed(() => sortExercices(exercicesStore.state.value));
const categories = categoriesStore.state;
const localites = localitesStore.state;

const getFormattedLocalite = (localiteId: number) =>
  localites.value.find((l) => l.id == localiteId)?.designation;
const getFormattedCategorie = (categorieid: number) =>
  categories.value.find((c) => c.id == categorieid)?.designation;

const { formatDate } = useDateFormatter();

const router = useRouter();
const openDetails = async (exercice: Exercice) => {
  const loading = await loadingController.create({
    message: "Chargement...",
  });

  await loading.present();
  router
    .push({ name: "exercice", params: { uuid: exercice.localUuid } })
    .then(() => {
      loading.dismiss();
    });
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="{ name: 'accueil' }" />
        </ion-buttons>
        <ion-title>Exercices</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list lines="inset">
        <ion-item v-if="!exercices.length"> Aucun exercice </ion-item>
        <ion-item
          v-for="exercice in exercices"
          :key="exercice.id"
          tappable
          @click="openDetails(exercice)"
        >
          <ion-icon
            slot="start"
            :icon="
              exercice.localStatus == 'empty'
                ? create
                : exercice.localStatus == 'in_progress'
                  ? create
                  : exercice.localStatus == 'validated'
                    ? sync
                    : warning
            "
            :aria-label="
              exercice.localStatus == 'empty'
                ? 'vide'
                : exercice.localStatus == 'in_progress'
                  ? 'en cours de création'
                  : exercice.localStatus == 'validated'
                    ? 'validé, à synchroniser'
                    : ''
            "
          />
          <p>
            <!-- TODO: Optionnel See if display can be improved -->
            <!-- {{ exercice.communication != '-' ? exercice.communication : exercice.categorie }} -->
            {{ formatDate(exercice.date, null) }} -
            {{ exercice.designation }}
            <br />
            <span class="details statut">
              {{
                exercice.localStatus == "empty"
                  ? "A saisir"
                  : exercice.localStatus == "in_progress"
                    ? "En cours d'édition"
                    : exercice.localStatus == "validated"
                      ? "Validé, en attente de synchronisation"
                      : ""
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

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
