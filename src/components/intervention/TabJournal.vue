<template>
  <ion-list>
    <ion-item>
      <ion-label text-right>Afficher uniquement les missions en cours</ion-label>
      <ion-checkbox color="primary" slot="end" v-model="onlyPendingMissions"></ion-checkbox>
    </ion-item>
  </ion-list>
  <section id="cd-timeline" class="cd-container">
    <div
      :class="['cd-timeline-block', colorMapping[event.type]]"
      v-for="event of evenements"
      :key="event.uuid"
    >
      <div class="cd-timeline-icon positive text-center">
        <ion-icon :name="iconMapping[event.type]"></ion-icon>
      </div>
      <div class="cd-timeline-content timeline-text positive" @click="openEvent(event)">
        <h4 class="title">{{ event.titre }}</h4>
        <p class="date">
          {{ formatDate(event.date, null) }}
          <span v-if="event.auteur">par {{ event.auteur }}</span>
        </p>
        <p class="description" v-if="event.description">{{ event.description }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid';
import useActiveIntervention from '@/store/useActiveIntervention';
import useDateFormatter from '@/tools/useDateFormatter';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonIcon,
} from '@ionic/vue';
import { computed, ref } from 'vue';
import { DateTime } from 'luxon';

const onlyPendingMissions = ref(true);
const { formatDate } = useDateFormatter();

enum EventType {
  OngoingMission,
  EndedMission,
  Appel,
  Info
}

const colorMapping = {
  [EventType.OngoingMission]: 'orange',
  [EventType.EndedMission]: 'green',
  [EventType.Appel]: 'blue',
  [EventType.Info]: 'grey',
}
const iconMapping = {
  [EventType.OngoingMission]: 'body',
  [EventType.EndedMission]: 'body',
  [EventType.Appel]: 'call',
  [EventType.Info]: 'play',
}

const { state } = useActiveIntervention()
const evenements = computed(() => {
  const missions = state.value.missions.filter(m => m.date_fin == null || !onlyPendingMissions.value);
  return [
    // Début intervention
    {
      uuid: uuidv4(),
      date: state.value.date_debut,
      type: EventType.Info,
      titre: 'Début de l\'intervention',
      description: 'TODO: Inondation à Glo',
      auteur: null
    },

    // Appels
    ...state.value.appels.map(a => ({
      ...a,
      uuid: uuidv4(),
      type: EventType.Appel,
      titre: a.nom + ' (' + a.numero + ')',
      description: '',
      auteur: null
    })),

    // Début de mission
    ...missions.map(m => ({
      ...m,
      uuid: uuidv4(),
      date: m.date_debut,
      type: m.date_fin == null ? EventType.OngoingMission : EventType.EndedMission,
      description: m.resume,
      auteur: m.sapeur
    })),
    // Fin de mission
    ...missions.filter(m => m.date_fin != null).map(m => ({
      ...m,
      uuid: uuidv4(),
      date: m.date_fin,
      type: m.date_fin == null ? EventType.OngoingMission : EventType.EndedMission,
      description: m.resume,
      auteur: m.sapeur
    }))
  ].sort((a, b) => DateTime.fromSQL(b.date).diff(DateTime.fromSQL(a.date)).toMillis())
});
console.log(evenements.value)

const openEvent = (event: any) => {
  //TODO: implement open event
}

</script>

<style scoped>
textarea {
  height: 200px;
}

.blue .positive {
  border-color: #4a87ee;
}
.blue .positive ion-icon {
  color: #4a87ee;
}
.blue .cd-timeline-content {
  background: #d7eef8;
}

.grey .positive {
  border-color: grey;
}
.grey .positive ion-icon {
  color: grey;
}
.grey .cd-timeline-content {
  background: #efefef;
}

.green .positive {
  border-color: #009c22;
}
.green .positive ion-icon {
  color: #009c22;
}
.green .cd-timeline-content {
  background: #e0ffdf;
}

.orange .positive {
  border-color: #d46200;
}
.orange .positive ion-icon,
.text-orange {
  color: #d46200;
}
.orange .cd-timeline-content {
  background: #fbe7d6;
}
.checkbox-item {
  margin-top: 22px;
}
.item-divider .label {
  font-size: 16px;
}
</style>