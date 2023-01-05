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
  alertController,
} from "@ionic/vue";
import useSapeurs from "@/store/useSapeurs";
import { Sapeur } from "@/models/sapeur";

const props = withDefaults(
  defineProps<{
    exceptSapeurIds?: number[];
    preSelectionSapeurIds?: number[];
    multiSelect?: boolean;
    autre?: boolean;
  }>(),
  { exceptSapeurIds: () => [], multiSelect: false }
);
const exceptIds = new Set(props.exceptSapeurIds ?? []);
const preSelectionSapeurIds = new Set(props.preSelectionSapeurIds ?? []);

const selectedSapeurId = new Set();

const query = ref("");
const sapeurModule = useSapeurs();
const filteredSapeur = computed(() => {
  return sapeurModule.state.value
    .filter((s) => !exceptIds.has(s.id))
    .filter((s) =>
      query.value !== ""
        ? (s.nom + "" + s.prenom)
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")
            ) > -1
        : (preSelectionSapeurIds.size && preSelectionSapeurIds.has(s.id)) ||
          !preSelectionSapeurIds.size
    )
    .sort((a, b) =>
      (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom)
    );
});

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
};

const dismiss = () => {
  modalController.dismiss(null);
};

const validate = () => {
  modalController.dismiss([...selectedSapeurId]);
};

const selectSapeur = (sapeur: Sapeur) => {
  if (!props.multiSelect) {
    modalController.dismiss(sapeur.id);
    return;
  }

  if (selectedSapeurId.has(sapeur.id)) {
    selectedSapeurId.delete(sapeur.id);
  } else {
    selectedSapeurId.add(sapeur.id);
  }
};

const autreSapeur = async () => {
  const prompt = await alertController.create({
    header: "Ajouter un sapeur",
    inputs: [
      {
        name: "designation",
        placeholder: "Désignation",
        type: "text",
      },
    ],
    buttons: [
      {
        text: "Annuler",
      },
      {
        text: "Valider",
        handler: (data) => {
          modalController.dismiss({ designation: data.designation });
        },
      },
    ],
  });
  await prompt.present();
};
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
    <ion-searchbar
      @ionInput="search($event)"
      placeholder="Rechercher..."
      ref="searchbar"
    ></ion-searchbar>

    <ion-list>
      <ion-item
        v-for="sapeur of filteredSapeur"
        :key="sapeur.id"
        @click="selectSapeur(sapeur)"
      >
        <ion-checkbox
          v-if="props.multiSelect"
          class="ion-margin-end"
        ></ion-checkbox>
        <ion-label>{{ sapeur.nom }} {{ sapeur.prenom }}</ion-label>
      </ion-item>
    </ion-list>
    <ion-button v-if="autre && !multiSelect" expand="block" @click="autreSapeur"
      >Autre</ion-button
    >
  </ion-content>
</template>

<style></style>
