<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Matériel consommable et en prêt</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          @click="addMateriel()"
          :disabled="intervention.localStatus == 'validated'"
        >
          <ion-icon slot="start" :icon="add" aria-hidden="true"></ion-icon
          >Ajouter du matériel
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-list>
    <ion-item v-if="!Object.entries(intervention.materiel).length"
      >Aucun matériel</ion-item
    >
    <ion-item
      v-for="([id, quantite], i) in (Object.entries(intervention.materiel) as [string, number][])"
      :key="i"
      :disabled="intervention.localStatus == 'validated'"
      @click="changeMaterielQuantity(parseInt(id), quantite)"
    >
      <p>
        <strong item-start>{{ quantite }}</strong>
        {{ materiels.find((m) => m.id == parseInt(id))?.designation }}
      </p>
      <ion-button
        slot="end"
        :disabled="intervention.localStatus == 'validated'"
        @click.stop="removeMateriel(parseInt(id))"
        fill="clear"
        color="dark"
      >
        <ion-icon slot="icon-only" :icon="close" aria-label="fermer"></ion-icon>
      </ion-button>
    </ion-item>
  </ion-list>
</template>

<script lang="ts" setup>
import {
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonItem,
  IonIcon,
  modalController,
  alertController,
} from "@ionic/vue";
import { add, close } from "ionicons/icons";
import useActiveIntervention from "../../store/useActiveIntervention";
import useMaterielsIntervention from "../../store/useMaterielsIntervention";
import ModalMaterielVue from "../modals/ModalMateriel.vue";

const materielModule = useMaterielsIntervention();
const materiels = materielModule.state;
const interventionModule = useActiveIntervention();
const intervention = interventionModule.state;

const removeMateriel = async (materielId: number) => {
  const materiel = materiels.value.find((m) => m.id == materielId);
  const confirm = await alertController.create({
    header: "Supprimer matériel",
    message:
      "Êtes-vous sûr de vouloir supprimer le matériel [" +
      materiel?.designation +
      "] ?",
    buttons: [
      {
        text: "Non",
      },
      {
        text: "Oui",
        handler: () => {
          interventionModule.removeMateriel(materielId);
        },
      },
    ],
  });
  await confirm.present();
};

const addMateriel = async () => {
  const modalSelectMateriel = await modalController.create({
    component: ModalMaterielVue,
  });

  await modalSelectMateriel.present();
  const { data } = await modalSelectMateriel.onDidDismiss();

  const materielId = data?.id;
  if (!materielId) {
    return;
  }

  const promptQuantite = await alertController.create({
    header: "Ajout matériel",
    message:
      "Veuillez entrer la quantité utilisée pour [" + data?.designation + "]",
    inputs: [
      {
        name: "quantite",
        placeholder: "Quantité",
        type: "number",
        value: 1,
        min: 0,
      },
    ],
    buttons: [
      {
        text: "Annuler",
        handler: (values) => ({ values, canceled: true }),
      },
      {
        text: "Valider",
      },
    ],
  });
  await promptQuantite.present();
  const res = await promptQuantite.onDidDismiss();

  const quantite = parseInt(res.data?.values?.quantite || 0);
  if (res.data?.canceled || !quantite) {
    return;
  }

  // Ajout du materiel
  const previousQuantite = intervention.value.materiel[materielId] || 0;

  interventionModule.updateMaterielQuantity(
    materielId,
    parseInt(previousQuantite || 0) + quantite
  );
};

const changeMaterielQuantity = async (
  materielId: number,
  currentQuantity: number
) => {
  const materiel = materiels.value.find((m) => m.id == materielId);
  const promptQuantite = await alertController.create({
    header: "Ajout matériel",
    message:
      "Veuillez entrer la quantité utilisée pour [" +
      materiel?.designation +
      "]",
    inputs: [
      {
        name: "quantite",
        placeholder: "Quantité",
        type: "number",
        value: currentQuantity,
        min: 0,
      },
    ],
    buttons: [
      {
        text: "Annuler",
        handler: (values) => ({ values, canceled: true }),
      },
      {
        text: "Valider",
      },
    ],
  });
  await promptQuantite.present();
  const res = await promptQuantite.onDidDismiss();

  if (res.data?.canceled) {
    return;
  }

  const quantite = parseInt(res.data?.values?.quantite);
  if (quantite == 0) {
    interventionModule.removeMateriel(materielId);
  } else {
    interventionModule.updateMaterielQuantity(materielId, quantite);
  }
};
</script>
