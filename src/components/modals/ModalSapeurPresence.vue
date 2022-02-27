<script lang="ts" setup>
import { defineProps, PropType, ref, reactive } from "vue";
import {
  IonToolbar,
  IonLabel,
  IonDatetime,
  IonInput,
  IonTitle,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from '@ionic/vue';
import useSapeurs from "@/store/useSapeurs";

interface Presence {
  nom: string,
  prenom: string,
  date_debut: null,
  date_fin: null,
  sapeur_id: null
}

const props: Presence = defineProps<Presence>();
const presence = reactive({ ...props })

const dismiss = () => {
  modalController.dismiss(null);
}

const save = () => {
  // modalController.dismiss(presence);
}

// const searchbar = ref<ComponentPublicInstance<HTMLInputElement>>();
// onMounted(() => {
//   searchbar.value?.$el.setFocus();
// })
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
      <ion-title>Détail d'une présence</ion-title>

      <ion-buttons right>
        <ion-button @click="save()">Enregistrer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    <ion-list>
      <ion-item>
        <ion-label fixed>Sapeur</ion-label>
        <ion-input
          type="text"
          readonly="true"
          :value="presence.nom + ' ' + presence.prenom"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label>Heure d'arrivée</ion-label>
        <ion-datetime
          displayFormat="DD.MM.YYYY HH:mm"
          pickerFormat="DD MM YYYY HH mm"
          cancelText="Annuler"
          doneText="Valider"
          v-modal="presence.date_debut"
          minuteValues="0,15,30,45"
        ></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label>Heure de départ</ion-label>
        <ion-datetime
          displayFormat="DD.MM.YYYY HH:mm"
          pickerFormat="DD MM YYYY HH mm"
          cancelText="Annuler"
          doneText="Valider"
          :min="presence.date_debut"
          v-modal="presence.date_fin"
          pickerOptions:="customPickerOptions"
          @ionChange="setCorrectTimezone()"
          minuteValues="0,15,30,45"
        ></ion-datetime>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style>
</style>