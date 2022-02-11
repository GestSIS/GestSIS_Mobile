<template>
  <ion-page>
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
        <ion-item @click="openModalDebut = !openModalDebut">
          <ion-label>Début</ion-label>
          <ion-text slot="end" id="open-modal">{{ mission.date_debut }}</ion-text>
          <ion-modal :is-open="openModalDebut">
            <!-- TODO: format date + fix display of ion-datetime in ion-modal -->
            <ion-datetime
              presentation="time-date"
              @ionChange="(ev: any) => mission.date_debut = ev.detail.value"
            />
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label floating>Responsable</ion-label>
          <ion-input
            type="text"
            readonly="true"
            @ionFocus="selectSapeur()"
            :value="mission.sapeur?.nom ? (mission.sapeur?.nom + ' ' + mission.sapeur?.prenom) : ''"
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

        <ion-item @click="openModalFin = !openModalFin">
          <ion-label>Quittancer</ion-label>
          <ion-text slot="end" id="open-modal">{{ mission.date_fin }}</ion-text>
          <ion-modal :is-open="openModalFin">
            <!-- TODO: format date + fix display of ion-datetime in ion-modal -->
            <ion-datetime
              presentation="time-date"
              :min="mission.date_debut"
              @ionChange="(ev: any) => mission.date_fin = ev.detail.value"
            />
          </ion-modal>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { defineProps, reactive, ref } from "vue";
import {
  IonPage,
  IonTitle,
  IonModal,
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
  IonText,
  modalController,
} from '@ionic/vue';
import { Mission } from "@/models/mission";
import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "@/store/useActiveIntervention";

const openModalDebut = ref(false);
const openModalFin = ref(false);

const router = useRouter();
const route = useRoute();
const data = route.params.mission ? route.params.mission as any as Mission : new Mission();
let mission = reactive(data)

const interventionModule = useActiveIntervention();

const formatDate = (value: string) => {
  return value;
};
const title = route.params.mission ? "Détail mission" : "Nouvelle mission";
// const mission = reactive((props.mission ? { ...props.mission } : new Mission()))

const dismiss = () => {
  modalController.dismiss()
}

const isInputComplete = () => {
  return true;
  // return mission.date_debut && mission.titre && mission.sapeur.nom
}

const save = () => {
  if (!isInputComplete()) {
    // TODO: Notification
    return;
  }
  if (mission.localUuid) {
    interventionModule.updateMission(mission);
  } else {
    interventionModule.addMission(mission);
  }
  router.back();
}
</script>

<style>
/* ion-popover.popover-bottom::part(content) {
  top: unset !important;
  left: 0 !important;
  bottom: 0;
  width: 100vw;
  border-radius: 0;
}
ion-popover.popover-bottom ion-datetime {
  margin-left: auto;
  margin-right: auto;
  
} */
</style>