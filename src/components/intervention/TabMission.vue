<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Missions</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button expand="block" @click="addMission()" :disabled="!intervention.en_creation">
          <ion-icon slot="start" name="add"></ion-icon>Nouvelle mission
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
  <ion-list>
    <ion-item
      button="true"
      v-for="(mission, i) in intervention.missions"
      :key="i"
      @click="editMission(mission)"
      :disabled="!intervention.en_creation"
    >
      <ion-icon slot="start" :name="mission.date_fin ? 'checkmark' : 'time'"></ion-icon>
      {{ mission.titre }} - {{ mission.sapeur.nom }}
      {{ mission.sapeur.prenom }}
      <p>{{ formatDate(mission.date_debut, "HH:mm 'le' dd.MM.yyyy") }}</p>
      <p>{{ mission.resume }}</p>
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
  // modalController
} from '@ionic/vue';
import useActiveIntervention from '@/store/useActiveIntervention';
import useDateFormatter from '@/tools/useDateFormatter';
import { useRouter } from 'vue-router';

const { formatDate } = useDateFormatter();
const { state } = useActiveIntervention();
const intervention = state;
const router = useRouter();

const addMission = async () => {
  // const modal = await modalController
  //   .create({
  //     component: InputMission,
  //     cssClass: 'my-custom-class',
  //     componentProps: {
  //       mission: null
  //     },
  //   })
  // return modal.present();
  router.push({ name: 'mission', params: { mission: null } })
};
const editMission = (mission: any) => {
  // TODO:
  router.push({ name: 'mission', params: { mission: mission } })
};

</script>