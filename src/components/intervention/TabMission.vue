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
    <ion-item v-if="!intervention.missions.length">Aucune mission</ion-item>
    <ion-item
      button="true"
      v-for="(mission, i) in intervention.missions"
      :key="i"
      @click="editMission(mission)"
      :disabled="!intervention.en_creation"
    >
      <ion-icon slot="start" :name="mission.date_fin ? 'checkmark' : 'time'"></ion-icon>
      <p>
        {{ mission.titre }} - {{ mission.sapeur.nom }}
        {{ mission.sapeur.prenom }}
        <br />
        <span class="details">{{ formatDate(mission.date_debut, "HH:mm 'le' dd.MM.yyyy") }}</span>
        <br />
        <span class="details">{{ mission.resume }}</span>
      </p>
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
} from '@ionic/vue';
import useActiveIntervention from '@/store/useActiveIntervention';
import useDateFormatter from '@/tools/useDateFormatter';
import { useRouter } from 'vue-router';

const { formatDate } = useDateFormatter();
const { state } = useActiveIntervention();
const intervention = state;
const router = useRouter();

const addMission = async () => {
  router.push({ name: 'mission', params: { uuid: 'null' } })
};
const editMission = (mission: any) => {
  router.push({ name: 'mission', params: { uuid: mission.localUuid } })
};

</script>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>