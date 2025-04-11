<script lang="ts" setup>
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
  IonSearchbar,
} from "@ionic/vue";
import { call } from "ionicons/icons";

import useTelephones from "../store/useTelephones";
import { computed, ref } from "vue";

const query = ref("");
const telephoneModule = useTelephones();
const filteredTelephone = computed(() => {
  return telephoneModule.state.value.filter(
    (m) =>
      (m.nom + " " + m.numero)
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .indexOf(query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")) >
      -1
  );
});

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="accueil" />
        </ion-buttons>
        <ion-title>Annuaire</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar
        placeholder="Rechercher..."
        @ion-input="search($event)"
      />

      <ion-list>
        <ion-item v-if="filteredTelephone.length === 0 && query !== ''">
          Aucun numéro correspondant
        </ion-item>
        <ion-item v-if="filteredTelephone.length === 0 && query === ''">
          Aucun numéro dans votre base de donnée
        </ion-item>
        <ion-item
          v-for="telephone of filteredTelephone"
          :key="telephone.id"
          :href="'tel:' + telephone.numero"
        >
          <ion-icon
            slot="start"
            :icon="call"
            aria-hidden="true"
          />
          {{ telephone.nom }}
          <span slot="end">{{ telephone.numero }}</span>
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
