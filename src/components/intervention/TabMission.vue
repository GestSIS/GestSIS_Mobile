<script lang="ts" setup>
import {
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonItem,
  IonIcon,
  IonCheckbox,
  IonLabel,
  alertController,
} from '@ionic/vue';
import useActiveIntervention from '@/store/useActiveIntervention';
import useDateFormatter from '@/tools/useDateFormatter';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

const { formatDate } = useDateFormatter();
const { state, removeMission } = useActiveIntervention();
const intervention = state;
const router = useRouter();

const addMission = async () => {
  router.push({ name: 'mission', params: { uuid: 'null' } });

};
const editMission = (mission: any) => {
  router.push({ name: 'mission', params: { uuid: mission.localUuid } });
};
const deleteMission = async (mission: any) => {
  const confirm = await alertController.create({
    header: 'Supprimer mission',
    message: "Êtes-vous sûr de vouloir supprimer la mission [" + mission?.titre + "] ?",
    buttons: [
      {
        text: 'Non'
      },
      {
        text: 'Oui',
        handler: () => {
          removeMission(mission);
        }
      }
    ]
  });
  await confirm.present();
};


const onlyPendingMissions = ref<boolean>(true);
const missions = computed(() => intervention.value.missions.filter(m => !m.date_fin || !onlyPendingMissions.value).sort((a, b) => b.date_debut.localeCompare(a.date_debut)))
const nbMissionEnCours = computed(() => intervention.value.missions.filter(m => !m.date_fin).length)
const nbMission = computed(() => intervention.value.missions.length)
</script>

<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Missions</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button expand="block" @click="addMission()" :disabled="intervention.localStatus == 'validated'">
          <ion-icon slot="start" name="add"></ion-icon>Nouvelle mission
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
  <ion-list>
    <ion-item>
      <ion-label text-right>Afficher uniquement les missions en cours ({{ nbMissionEnCours }} / {{ nbMission }})
      </ion-label>
      <ion-checkbox color="primary" slot="end" v-model="onlyPendingMissions"></ion-checkbox>
    </ion-item>
    <ion-item v-if="!intervention.missions.length">Aucune mission</ion-item>
    <ion-item button="true" v-for="(mission, i) in missions" :key="i"
      :disabled="intervention.localStatus == 'validated'" @click="editMission(mission)">
      <ion-icon slot="start" :name="mission.date_fin ? 'checkmark' : 'time'"></ion-icon>
      <p>
        {{ mission.titre }} - {{ mission.sapeur.nom }}
        {{ mission.sapeur.prenom }}
        <br />
        <span class="details">{{ formatDate(mission.date_debut, "HH:mm 'le' dd.MM.yyyy") }}</span>
        <br />
        <span class="details">{{ mission.resume }}</span>
      </p>
      <ion-button :disabled="intervention.localStatus == 'validated'" @click.stop="deleteMission(mission)" fill="clear"
        color="dark" slot="end">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </ion-item>
  </ion-list>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>