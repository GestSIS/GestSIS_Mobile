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
} from "@ionic/vue";
import useMissionsTypes from "../../store/useMissionTypes.ts";
import type { MissionType } from "../../models/missiontype.ts";

const query = ref("");
const missionModule = useMissionsTypes();
const filteredMission = computed(() => {
  return missionModule.state.value
    .filter(
      (m) =>
        m.titre
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .indexOf(
            query.value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""),
          ) > -1,
    )
    .sort((a, b) => a.titre.localeCompare(b.titre));
});

const search = (event: any) => {
  query.value = event.target.value;
};

const selectMission = (mission: MissionType) => {
  modalController.dismiss(mission);
};

const dismiss = () => {
  modalController.dismiss(null);
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Sélection du titre de la mission</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()"> Annuler </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-searchbar placeholder="Saisir" @ion-input="search($event)" />

    <ion-list>
      <ion-item
        v-if="query.length > 0"
        @click="selectMission({ titre: query, id: 0 })"
      >
        {{ query }}
      </ion-item>
      <ion-item
        v-for="mission of filteredMission"
        :key="mission.id"
        button
        @click="selectMission(mission)"
      >
        {{ mission.titre }}
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style></style>
