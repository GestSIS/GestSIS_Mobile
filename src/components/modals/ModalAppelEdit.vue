<script lang="ts" setup>
import { ref, defineProps } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonList,
  IonTextarea,
  IonButtons,
  IonHeader,
  IonLabel,
  IonPopover,
  IonIcon,
  IonDatetime,
  IonInput,
  IonText,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from '@ionic/vue';
import { useNotify } from "@/tools/useToast";
import { Appel } from "@/models/appel";
import { DateTime } from "luxon";
import useDateFormatter from "@/tools/useDateFormatter";
import useActiveIntervention from "@/store/useActiveIntervention";
import BaseDatetime from "../base/BaseDatetime.vue";

const { formatDate } = useDateFormatter();
const notify = useNotify();

const { updateAppel } = useActiveIntervention();
const props = defineProps<{ appel: Appel }>();

const appel = ref(props.appel || new Appel());

const isPhoneNumber = (str: string): boolean => {
  return /^(?=.*\d)[\d ]+$/.test(str);
}

const save = async () => {
  if (appel.value?.nom == '' || appel.value.numero == '') {
    notify.error('Veuillez remplir tous les champs');
    return;
  } else if (!isPhoneNumber(appel.value.numero || '')) {
    notify.error("Numéro de téléphone invalid");
    return;
  }

  updateAppel(appel.value);
  modalController.dismiss();
}

const dismiss = () => {
  modalController.dismiss();
}

</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Modifier appel</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list no-lines>
      <base-datetime v-model="appel.date">Date</base-datetime>

      <ion-item>
        <ion-label position="fixed">Numéro</ion-label>
        <ion-input v-model="appel.numero"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Nom</ion-label>
        <ion-input v-model="appel.nom"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Commentaire</ion-label>
        <ion-textarea v-model="appel.commentaire"></ion-textarea>
      </ion-item>
    </ion-list>

    <ion-button expand="full" class="ion-margin-top" @click="save">Modifier</ion-button>
  </ion-content>
</template>

<style>
</style>
