<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Appels</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          @click="addCall()"
          :disabled="intervention.localStatus == 'validated'"
        >
          <ion-icon :icon="add" slot="start" aria-hidden="true"></ion-icon
          >Nouvel appel
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-list>
    <ion-item v-if="!intervention.appels.length">Aucun appel</ion-item>
    <ion-item
      :button="true"
      v-for="appel in sortedAppels"
      :key="appel.localUuid"
      :disabled="intervention.localStatus == 'validated'"
      @click="editCall(appel)"
    >
      <p>
        {{ appel.nom }} - {{ appel.numero }}
        <br />
        <span class="details"
          >Appelé à {{ formatDate(appel.date, "HH:mm 'le' dd.MM.yyyy") }}</span
        >
        <br />
        <span class="details">{{ appel.commentaire }}</span>
      </p>
      <ion-button
        @click.stop="removeCall(appel)"
        fill="clear"
        color="dark"
        slot="end"
        :disabled="intervention.localStatus == 'validated'"
        aria-label="Fermer"
      >
        <ion-icon slot="icon-only" :icon="close" aria-hidden="true"></ion-icon>
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
import useDateFormatter from "../../tools/useDateFormatter";
import ModalAppelVue from "../modals/ModalAppelSelect.vue";
import { DateTime } from "luxon";
import { Appel } from "../../models/appel";
import ModalAppelEditVue from "../modals/ModalAppelEdit.vue";
import { computed } from "vue";

const { formatDate } = useDateFormatter();
const { state, addAppel, removeAppel } = useActiveIntervention();
const intervention = state;

const sortedAppels = computed(() =>
  intervention.value.appels.slice().sort((a, b) => b.date.localeCompare(a.date))
);

const addCall = async () => {
  const modalAppel = await modalController.create({
    component: ModalAppelVue,
  });

  await modalAppel.present();
  const { data } = await modalAppel.onDidDismiss();

  if (!data) {
    return;
  }
  const tel = data;

  const prompt = await alertController.create({
    header: "Ajout appel",
    message: "Commentaire pour appel de " + tel.nom + " (" + tel.numero + ")",
    inputs: [
      {
        name: "commentaire",
        placeholder: "Commentaire",
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
          const appel = {
            ...tel,
            date: DateTime.now().toSQL({ includeOffset: false })?.slice(0, 16),
            commentaire: data.commentaire,
          };
          addAppel(appel);
        },
      },
    ],
  });
  await prompt.present();
};

const editCall = async (appel: any) => {
  const modalAppel = await modalController.create({
    component: ModalAppelEditVue,
    componentProps: {
      appel: { ...appel },
    },
  });

  await modalAppel.present();
};

const removeCall = async (appel: Appel) => {
  const confirm = await alertController.create({
    header: "Supprimer appel",
    message: "Êtes-vous sûr de vouloir supprimer l'appel [" + appel.nom + "] ?",
    buttons: [
      {
        text: "Non",
      },
      {
        text: "Oui",
        handler: () => {
          removeAppel(appel);
        },
      },
    ],
  });
  await confirm.present();
};
</script>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
