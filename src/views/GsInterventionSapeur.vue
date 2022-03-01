<script lang="ts" setup>
import { Ref, ref, reactive, normalizeClass, defineProps } from "vue";
import {
  IonPage,
  IonRow,
  IonCol,
  IonGrid,
  IonCheckbox,
  IonTitle,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonList,
  IonLabel,
  IonDatetime,
  IonContent,
  IonButton,
  IonItem,
  IonBackButton,
  modalController,
  IonIcon
} from '@ionic/vue';

import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "@/store/useActiveIntervention";

import useSapeurs from "@/store/useSapeurs";
import useDateFormatter from "@/tools/useDateFormatter";
import { DateTime } from "luxon";
import ModalSapeurSelectVue from "@/components/modals/ModalSapeurSelect.vue";

const router = useRouter();
const route = useRoute();

const mode = route.params.mode as "ARRIVEE" | "DEPART";
const presences: { date: null, mode: "ARRIVEE" | "DEPART", sapeurs: Array<{ nom: string, prenom: string, id: number, selected: boolean }> }
  = reactive({ date: null, sapeurs: [], mode: mode });

const { formatDate } = useDateFormatter();
const sapeurModule = useSapeurs();

// const { addSapeurArrival, addSapeurDeparture } = useActiveIntervention();
const { updateSapeurs } = useActiveIntervention();

const title = route.params.mission ? "Détail mission" : "Nouvelle mission";
const interventionModule = useActiveIntervention();
const sapeursDejaPresent = [];

const addSapeurs = async () => {
  const modalSapeurSelect = await modalController
    .create({
      component: ModalSapeurSelectVue,
      componentProps: {
        exceptSapeurIds: [],
        multiSelect: true,
      }
    })

  await modalSapeurSelect.present();
  let { data } = await modalSapeurSelect.onDidDismiss();

  if (!data) {
    return;
  }

  const ids = new Set(data);
  const sapeurs = sapeurModule.state.value.filter(s => ids.has(s.id));
  presences.sapeurs = [
    ...presences.sapeurs,
    ...sapeurs.map(s => ({ nom: s.nom, prenom: s.prenom, id: s.id, selected: true }))
  ].sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));
}

const save = () => {
  if (mode == 'ARRIVEE') {
    // addSapeurArrival();
    // updateSapeurs();
    //TODO: Complete this part
  } else {
    // interventionModule.addMission(mission.value);
  }
  router.back();
}
</script>

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
            v-model="presences.date"
            minuteValues="0,15,30,45"
          ></ion-datetime>
        </ion-item>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col size="8">
            <h3>Sapeurs</h3>
          </ion-col>
          <ion-col v-if="mode == 'ARRIVEE'" size="4">
            <ion-button expand="block" @click="addSapeurs()">
              Autres sapeurs
              <ion-icon name="add" slot="start"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list>
        <ion-item v-for="sapeur of presences.sapeurs" :key="sapeur.id">
          <ion-checkbox v-model="sapeur.selected"></ion-checkbox>
          <ion-label>{{ sapeur.nom }} {{ sapeur.prenom }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style>
</style>