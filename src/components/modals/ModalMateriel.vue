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
import useMaterielsIntervention from "../../store/useMaterielsIntervention";

const query = ref("");
const materielModule = useMaterielsIntervention();
const filteredMateriel = computed(() => {
  return materielModule.state.value.filter(
    (m) => m.designation.toLowerCase().indexOf(query.value) > -1
  );
});

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
};

const dismiss = () => {
  modalController.dismiss(null);
};
const selectMateriel = (materiel: any) => {
  modalController.dismiss(materiel);
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Sélection du matériel</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">
          Annuler
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-searchbar
      placeholder="Rechercher..."
      @ion-input="search($event)"
    />

    <ion-list>
      <ion-item
        v-for="materiel of filteredMateriel"
        :key="materiel.id"
        button
        @click="selectMateriel(materiel)"
      >
        {{ materiel.designation }}
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style></style>
