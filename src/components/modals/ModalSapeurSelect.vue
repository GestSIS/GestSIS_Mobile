<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonCheckbox,
  IonSearchbar,
  IonButtons,
  IonHeader,
  IonLabel,
  IonList,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  modalController,
  alertController,
} from "@ionic/vue";
import { arrowBack } from "ionicons/icons";
import useSapeurs from "../../store/useSapeurs.ts";
import type { Sapeur } from "../../models/sapeur.ts";

const props = withDefaults(
  defineProps<{
    exceptSapeurIds?: number[];
    preSelectionSapeurIds?: number[];
    multiSelect?: boolean;
    autre?: boolean;
  }>(),
  { exceptSapeurIds: () => [], multiSelect: false },
);
const exceptIds = new Set(props.exceptSapeurIds ?? []);
const preSelectionIds = new Set(props.preSelectionSapeurIds ?? []);

const selectedSapeurId = new Set<number>();

const query = ref("");
const sapeurModule = useSapeurs();
const filteredSapeur = computed(() => {
  return sapeurModule.state.value
    .filter((s) => s.actif)
    .filter((s) => !exceptIds.has(s.id))
    .filter((s) =>
      query.value !== ""
        ? (s.nom + "" + s.prenom)
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              query.value.normalize("NFD").replace(/\p{Diacritic}/gu, ""),
            ) > -1
        : (preSelectionIds.size && preSelectionIds.has(s.id)) ||
          !preSelectionIds.size,
    )
    .sort((a, b) =>
      (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom),
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
          <ion-icon :icon="arrowBack" aria-label="fermer" />
        </ion-button>
      </ion-buttons>

      <ion-title>Ajouter un sapeur</ion-title>

      <ion-buttons v-if="props.multiSelect" slot="end">
        <ion-button @click="validate()"> Valider </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-searchbar
      ref="searchbar"
      placeholder="Rechercher..."
      @ion-input="search($event)"
    />

    <ion-list>
      <ion-item
        v-for="sapeur of filteredSapeur"
        :key="sapeur.id"
        button
        @click="selectSapeur(sapeur)"
      >
        <ion-checkbox v-if="props.multiSelect" class="ion-margin-end">
          {{ sapeur.nom }} {{ sapeur.prenom }}
        </ion-checkbox>
        <ion-label v-else> {{ sapeur.nom }} {{ sapeur.prenom }} </ion-label>
      </ion-item>
    </ion-list>
    <ion-button
      v-if="autre && !multiSelect"
      expand="block"
      @click="autreSapeur"
    >
      Autre
    </ion-button>
  </ion-content>
</template>

<style></style>
