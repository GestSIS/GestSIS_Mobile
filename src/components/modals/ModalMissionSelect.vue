<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Sélection du titre de la mission</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    <ion-searchbar @ionInput="search($event)" placeholder="Saisir"></ion-searchbar>

    <ion-list>
      <ion-item v-if="query.length > 0" @click="selectMission(query)">{{ query }}</ion-item>
      <ion-item
        v-for="mission of filteredMission"
        :key="mission.id"
        @click="selectMission(mission)"
      >{{ mission.titre }}</ion-item>
    </ion-list>
  </ion-content>
</template>


<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from '@ionic/vue';
import useMissionsTypes from "@/store/useMissionTypes";

const query = ref("")
const missionModule = useMissionsTypes();
const filteredMission = computed(() => {
  return missionModule.state.value.filter(m => (m.titre)
    .toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .indexOf(query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")) > -1)
    .sort((a, b) => a.titre.localeCompare(b.titre))
})

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
}

const dismiss = () => {
  modalController.dismiss(null);
}
const selectMission = (mission: any) => {
  modalController.dismiss(mission);
}
</script>

<style>
</style>
