<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'exercices' }"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          <ion-button slot="end" @click="save()">Enregistrer</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content padding>
      <ion-list>
        <ion-item @click="openModalDebut = !openModalDebut">
          <ion-label>Début</ion-label>
          <ion-text
            slot="end"
            id="open-modal"
          >{{ formatDate(mission.date_debut, 'dd.LL.yy HH:mm') }}</ion-text>
          <ion-modal :is-open="openModalDebut">
            <ion-datetime
              presentation="time-date"
              :value="DateTime.fromSQL(mission.date_debut).toISO()"
              @ionChange="(ev: any) => mission.date_debut = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
            />
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Responsable</ion-label>
          <ion-input
            type="text"
            readonly="true"
            @ionFocus="selectSapeur()"
            :value="mission.sapeur?.nom ? (mission.sapeur?.nom + ' ' + mission.sapeur?.prenom) : ''"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Mission</ion-label>
          <ion-input type="text" :value="mission.titre" @ionFocus="selectTitre()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Résumé</ion-label>
          <ion-textarea :rows="10" :auto-grow="true" v-model="mission.resume"></ion-textarea>
        </ion-item>

        <ion-item button @click="openModalFin = !openModalFin">
          <ion-label>Quittancer</ion-label>
          <ion-text
            slot="end"
            id="open-modal"
          >{{ mission.date_fin ? formatDate(mission.date_fin, 'dd.LL.yy HH:mm') : '' }}</ion-text>
          <ion-button fill="clear" slot="end">
            <ion-icon slot="end" name="calendar" />
          </ion-button>
          <ion-modal :is-open="openModalFin">
            <ion-datetime
              presentation="time-date"
              :min="DateTime.fromSQL(mission.date_debut).toISO()"
              :value="DateTime.fromSQL(mission.date_fin).toISO()"
              @ionChange="(ev: any) => mission.date_fin = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
            />
          </ion-modal>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";
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
  IonBackButton,
  IonText,
  modalController,
  IonIcon
} from '@ionic/vue';
import { Mission } from "@/models/mission";
import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "@/store/useActiveIntervention";

import ModalSapeurSelectVue from "@/components/modals/ModalSapeurSelect.vue";
import ModalMissionSelectVue from "@/components/modals/ModalMissionSelect.vue";
import useSapeurs from "@/store/useSapeurs";
import useDateFormatter from "@/tools/useDateFormatter";
import { DateTime } from "luxon";

const { formatDate } = useDateFormatter();
const sapeurModule = useSapeurs();

const openModalDebut = ref(false);
const openModalFin = ref(false);

const router = useRouter();
const route = useRoute();
const missionUuid = route.params.uuid;
const interventionStore = useActiveIntervention();

const loadedMission = Object.assign({}, interventionStore.state.value.missions.find(m => m.localUuid == missionUuid));
const mission: Ref<Mission> = ref(loadedMission || new Mission());
if (!mission.value.date_debut) {
  mission.value.date_debut = DateTime.now().toSQL({ includeOffset: false }).slice(0, 16);
}

const title = route.params.mission ? "Détail mission" : "Nouvelle mission";

const isInputComplete = () => {
  return mission.value.date_debut && mission.value.titre && mission.value.sapeur?.nom
}

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
  mission.value.sapeur = {
    id: data,
    nom: sapeur?.nom || '',
    prenom: sapeur?.prenom || ''
  };
}

const selectTitre = async () => {
  const modalTitreMission = await modalController
    .create({
      component: ModalMissionSelectVue,
    })

  await modalTitreMission.present();
  let { data } = await modalTitreMission.onDidDismiss();

  if (!data) {
    return;
  }
  mission.value.titre = data.titre;
}

const save = () => {
  if (!isInputComplete()) {
    // TODO: Notification
    return;
  }
  if (mission.value.localUuid) {
    interventionStore.updateMission(mission.value);
  } else {
    interventionStore.addMission(mission.value);
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