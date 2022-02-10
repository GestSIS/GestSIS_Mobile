<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons>
        <ion-button slot="start" @click="dismiss()">
          <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
        </ion-button>
        <ion-title>{{ title }}</ion-title>
      </ion-buttons>

      <ion-buttons slot="end">
        <ion-button slot="end" @click="save()">Enregistrer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    <ion-list>
      <ion-item>
        <ion-label floating>Début</ion-label>
        <ion-datetime
          displayFormat="DD.MM.YYYY HH:mm"
          pickerFormat="DD MM YYYY HH mm"
          cancelText="Annuler"
          doneText="Valider"
          v-model="mission.date_debut"
        ></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label floating>Responsable</ion-label>
        <ion-input
          type="text"
          readonly="true"
          @ionFocus="selectSapeur()"
          :value="mission.sapeur.nom ? (mission.sapeur.nom + ' ' + mission.sapeur.prenom) : ''"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label floating>Mission</ion-label>
        <ion-input type="text" v-model="mission.titre" @ionFocus="selectTitre()"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label floating>Résumé</ion-label>
        <ion-textarea v-model="mission.resume"></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label floating>Quittancer</ion-label>
        <ion-datetime
          displayFormat="DD.MM.YYYY HH:mm"
          pickerFormat="DD MM YYYY HH mm"
          cancelText="Annuler"
          doneText="Valider"
          v-model="mission.date_fin"
          :min="mission.date_debut"
          :pickerOptions="customPickerOptions"
          @ionChange="setCorrectTimezone()"
        ></ion-datetime>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script lang="ts" setup>
import { defineProps, reactive } from "vue";
import {
  IonTitle,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonList,
  IonInput,
  IonTextarea,
  IonLabel,
  IonDatetime,
  IonContent,
  IonButton,
  IonItem,
  IonIcon,
  modalController,
} from '@ionic/vue';
import { Mission } from "@/models/mission";

const props = defineProps<{
  mission?: Mission
}>();

const title = props.mission ? "Détail mission" : "Nouvelle mission";
const mission = reactive((props.mission ? { ...props.mission } : new Mission()))

const dismiss = () => {
  modalController.dismiss()
}

const isInputComplete = () => {
  return mission.date_debut && mission.titre && mission.sapeur.nom
}

const save = () => {
  if (!isInputComplete()) {
    // TODO: Notification
    return;
  }
  modalController.dismiss(mission)
}
</script>