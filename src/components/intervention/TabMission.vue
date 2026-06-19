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
  alertController,
} from "@ionic/vue";
import { add, checkmark, time, close } from "ionicons/icons";
import useActiveIntervention from "../../store/useActiveIntervention.ts";
import useDateFormatter from "../../tools/useDateFormatter.ts";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import type { Mission } from "../../models/mission.ts";

const { formatDate } = useDateFormatter();
const { state, removeMission } = useActiveIntervention();
const intervention = state;
const router = useRouter();

const addMission = async () => {
  router.push({ name: "mission", params: { uuid: "null" } });
};
const editMission = (mission: Mission) => {
  router.push({ name: "mission", params: { uuid: mission.localUuid } });
};
const deleteMission = async (mission: Mission) => {
  const confirm = await alertController.create({
    header: "Supprimer mission",
    message:
      "Êtes-vous sûr de vouloir supprimer la mission [" +
      mission?.titre +
      "] ?",
    buttons: [
      {
        text: "Non",
      },
      {
        text: "Oui",
        handler: () => {
          removeMission(mission);
        },
      },
    ],
  });
  await confirm.present();
};

const onlyPendingMissions = ref<boolean>(true);
const missions = computed(() =>
  intervention.value.missions
    .filter((m) => !m.date_fin || !onlyPendingMissions.value)
    .sort((a, b) => b.date_debut.localeCompare(a.date_debut)),
);
const nbMissionEnCours = computed(
  () => intervention.value.missions.filter((m) => !m.date_fin).length,
);
const nbMission = computed(() => intervention.value.missions.length);
</script>

<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Missions</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          :disabled="intervention.localStatus == 'validated'"
          @click="addMission()"
        >
          <ion-icon slot="start" :icon="add" aria-hidden="true" />Nouvelle
          mission
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
  <ion-list>
    <ion-item>
      <ion-checkbox slot="end" v-model="onlyPendingMissions" color="primary">
        Afficher uniquement les missions en cours ({{ nbMissionEnCours }} /
        {{ nbMission }})
      </ion-checkbox>
    </ion-item>
    <ion-item v-if="!intervention.missions.length"> Aucune mission </ion-item>
    <ion-item v-else-if="!missions.length">
      <p>
        Aucune mission en cours !
        <br />
        <span class="details"
          >Désactivez le filtre pour afficher les missions terminées</span
        >
      </p>
    </ion-item>
    <ion-item
      v-for="mission in missions"
      :key="mission.localUuid"
      :button="true"
      :disabled="intervention.localStatus == 'validated'"
      @click="editMission(mission)"
    >
      <ion-icon
        slot="start"
        :icon="mission.date_fin ? checkmark : time"
        aria-hidden="true"
      />
      <p>
        {{ mission.titre }} - {{ mission.sapeur.designation }}
        <br />
        <span class="details">{{
          formatDate(mission.date_debut, "HH:mm 'le' dd.MM.yyyy")
        }}</span>
        <br />
        <span class="details">{{ mission.resume }}</span>
      </p>
      <ion-button
        slot="end"
        :disabled="intervention.localStatus == 'validated'"
        fill="clear"
        color="dark"
        @click.stop="deleteMission(mission)"
      >
        <ion-icon slot="icon-only" :icon="close" aria-label="fermer" />
      </ion-button>
    </ion-item>
  </ion-list>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
