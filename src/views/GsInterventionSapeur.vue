<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'intervention' }"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          <ion-button slot="end" @click="save()">Valider</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content padding>
      <ion-list>
        <ion-item>
          <ion-label>Heure {{ mode == 'ARRIVEE' ? "d'arrivée" : 'de départ' }}</ion-label>
          <ion-datetime
            displayFormat="DD.MM.YYYY HH:mm"
            pickerFormat="DD MM YYYY HH mm"
            cancelText="Annuler"
            doneText="Valider"
            v-model="presence.date"
            minuteValues="0,15,30,45"
          ></ion-datetime>
        </ion-item>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col col-8>
            <h3>Sapeurs</h3>
          </ion-col>
          <ion-col v-if="presence.type == 'ARRIVEE'" col-4>
            <ion-button block slot="start" @click="addSapeurs()">
              <ion-icon name="add" item-start></ion-icon>Autres sapeurs
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list>
        <ion-item v-for="sapeur of presence.sapeurs" :key="sapeur.id">
          <ion-label>{{ sapeur.nom }} {{ sapeur.prenom }}</ion-label>
          <ion-checkbox v-model="sapeur.selected"></ion-checkbox>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";
import {
  IonPage,
  IonRow,
  IonCol,
  IonGrid,
  IonCheckbox,
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
  IonBackButton,
  IonText,
  modalController,
  IonIcon
} from '@ionic/vue';
import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "@/store/useActiveIntervention";

import useSapeurs from "@/store/useSapeurs";
import useDateFormatter from "@/tools/useDateFormatter";
import { DateTime } from "luxon";
import ModalSapeurSelectVue from "@/components/modals/ModalSapeurSelect.vue";

const { formatDate } = useDateFormatter();
const sapeurModule = useSapeurs();

const router = useRouter();
const route = useRoute();
const mode = route.params.mode;
const { addSapeurArrival, addSapeurDeparture } = useActiveIntervention();

const title = route.params.mission ? "Détail mission" : "Nouvelle mission";
const interventionModule = useActiveIntervention();
const sapeursDejaPresent = [];

const selectSapeur = async () => {
  const modalSapeurSelect = await modalController
    .create({
      component: ModalSapeurSelectVue,
      componentProps: {
        exceptSapeurIds: [],
      }
    })

  await modalSapeurSelect.present();
  let { data } = await modalSapeurSelect.onDidDismiss();

  if (!data) {
    return;
  }

  const sapeur = sapeurModule.state.value.find(s => s.id == data);
  interventionModule.state.value.sapeur = {
    id: data,
    nom: sapeur?.nom || '',
    prenom: sapeur?.prenom || ''
  };
}

const save = () => {
  if (mode == 'ARRIVEE') {
    addSapeurArrival();
  } else {
    // interventionModule.addMission(mission.value);
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