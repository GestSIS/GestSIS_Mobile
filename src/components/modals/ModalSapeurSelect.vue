<script lang="ts" setup>
import { defineProps, computed, ref, withDefaults } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonLabel,
  IonCheckbox,
  IonSearchbar,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  modalController,
} from '@ionic/vue';
import useSapeurs from "@/store/useSapeurs";
import { Sapeur } from "@/models/sapeur";

const props = withDefaults(defineProps<{
  exceptSapeurIds?: number[],
  multiSelect?: boolean
}>(), { exceptSapeurIds: () => [], multiSelect: false });
const exceptIds = new Set(props.exceptSapeurIds);

// const { exceptSapeurIds = [], multiSelect = false } = defineProps<{
//   exceptSapeurIds?: number[],
//   multiSelect?: boolean
// }>();


const query = ref("")
const sapeurModule = useSapeurs();
const filteredSapeur = computed(() => {
  return sapeurModule.state.value
    .filter(s => !exceptIds.has(s.id))
    .filter(s => (s.nom + "" + s.prenom)
      .toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .indexOf(query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")) > -1)
    .sort((a, b) => (a.nom + " " + a.prenom).localeCompare((b.nom + " " + b.prenom)))
})

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
}

const dismiss = () => {
  modalController.dismiss(null);
}

const validate = () => {
  // TODO:
  modalController.dismiss(null);
}

const selectSapeur = (sapeur: Sapeur) => {
  if (!props.multiSelect) {
    modalController.dismiss(sapeur.id);
  }
}

// const searchbar = ref<ComponentPublicInstance<HTMLInputElement>>();
// onMounted(() => {
//   searchbar.value?.$el.setFocus();
// })
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button slot="start" @click="dismiss()">
          <ion-icon name="arrow-back"></ion-icon>
        </ion-button>
      </ion-buttons>

      <ion-title>Ajouter un sapeur</ion-title>

      <ion-buttons v-if="props.multiSelect" slot="end">
        <ion-button @click="validate()">Valider</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-searchbar @ionInput="search($event)" placeholder="Rechercher..." ref="searchbar"></ion-searchbar>

    <ion-list>
      <ion-item v-for="sapeur of filteredSapeur" :key="sapeur.id" @click="selectSapeur(sapeur)">
        <ion-checkbox v-if="props.multiSelect" class="ion-margin-end"></ion-checkbox>
        <ion-label>{{ sapeur.nom }} {{ sapeur.prenom }}</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style>
</style>