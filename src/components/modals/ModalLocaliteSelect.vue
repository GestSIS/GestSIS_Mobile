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
import useLocalites from "../../store/useLocalites";
import useLocalitesSis from "../../store/useLocalitesSis";
import type { Localite } from "../../models/localite";

const query = ref("");
const localiteModule = useLocalites();
const localiteSisModule = useLocalitesSis();
const filteredLocalite = computed(() => {
  const localitesSis = new Set(localiteSisModule.state.value);
  return localiteModule.state.value
    .filter(
      (l) =>
        localitesSis.size === 0 || localitesSis.has(l.id) || query.value !== ""
    )
    .filter(
      (l) =>
        (l.npa + "" + l.designation)
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .indexOf(
            query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")
          ) > -1
    )
    .sort((a, b) =>
      (a.npa + " " + a.designation).localeCompare(b.npa + " " + b.designation)
    );
});

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
};

const dismiss = () => {
  modalController.dismiss(null);
};

const selectLocalite = (localite: Localite) => {
  modalController.dismiss(localite.id);
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Sélection de la localité</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">
          Annuler
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-searchbar
      placeholder="Saisir..."
      @ion-input="search($event)"
    />

    <ion-list>
      <ion-item
        v-for="localite of filteredLocalite"
        :key="localite.id"
        button
        @click="selectLocalite(localite)"
      >
        {{ localite.npa }} {{ localite.designation }}
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style></style>
