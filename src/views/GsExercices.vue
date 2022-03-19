<script lang="ts" setup>
import { Exercice } from '@/models/bundle';

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
} from '@ionic/vue';

import { computed } from 'vue';
import useExercices from '@/store/useExercices';
import useExcuseTypes from '@/store/useExcuseTypes';
import useLocalites from '@/store/useLocalites';
import useExerciceCategories from '@/store/useExerciceCategories';
import { useRouter } from 'vue-router';
import useDateFormatter from '@/tools/useDateFormatter';
import { DateTime } from 'luxon';

const exercicesStore = useExercices();
const categoriesStore = useExerciceCategories();
const excusesStore = useExcuseTypes();
const localitesStore = useLocalites();

const sortExercices = (exercices: Exercice[]): Exercice[] => {
  return exercices
    .slice(0)
    .sort((a, b) =>
      DateTime.fromSQL(b.date).diff(DateTime.fromSQL(a.date)).toMillis()
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
const openDetails = (exercice: Exercice) => {
  router.push({ name: 'exercice', params: { uuid: exercice.localUuid } });
};
</script>

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
      <ion-list lines="inset">
        <ion-item v-if="!exercices.length">Aucun exercice</ion-item>
        <ion-item
          tappable
          v-for="exercice in exercices"
          :key="exercice.id"
          @click="openDetails(exercice)"
        >
          <ion-icon slot="start" :name="exercice.en_creation ? 'create' : 'sync'"></ion-icon>
          <p>
            <!-- TODO: Optional See if display can be improved -->
            <!-- {{ exercice.communication != '-' ? exercice.communication : exercice.categorie }} -->
            {{ formatDate(exercice.date, null) }} -
            {{ exercice.designation }}
            <br />
            <span class="details statut">
              {{
                exercice.en_creation
                  ? "En cours d'édition"
                  : 'Validé, en attente de synchronisation'
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
