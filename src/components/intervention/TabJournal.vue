<script lang="ts" setup>
import { v4 as uuidv4 } from "uuid";
import useActiveIntervention from "@/store/useActiveIntervention";
import useDateFormatter from "@/tools/useDateFormatter";
import {
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonIcon,
  modalController,
} from "@ionic/vue";
import { computed, ref } from "vue";
import { DateTime } from "luxon";
import useSapeurs from "@/store/useSapeurs";
import ModalAppelEditVue from "../modals/ModalAppelEdit.vue";
import { useRouter } from "vue-router";

const onlyPendingMissions = ref<boolean>(true);
const { formatDate } = useDateFormatter();

enum EventType {
  OngoingMission,
  EndedMission,
  Appel,
  Info,
}

const colorMapping = {
  [EventType.OngoingMission]: "orange",
  [EventType.EndedMission]: "green",
  [EventType.Appel]: "blue",
  [EventType.Info]: "grey",
};
const iconMapping = {
  [EventType.OngoingMission]: "body",
  [EventType.EndedMission]: "body",
  [EventType.Appel]: "call",
  [EventType.Info]: "play",
};

const router = useRouter();
const { state } = useActiveIntervention();
const sapeurStore = useSapeurs();
const intervention = state;

interface Event {
  uuid: string;
  date: string;
  type: EventType;
  titre: string;
  description: string;
  auteur: string;
}

const evenements = computed(() => {
  const missions = intervention.value.missions.filter(
    (m) => !m.date_fin || !onlyPendingMissions.value
  );
  const chefIntervention = sapeurStore.state.value.find(
    (s) => s.id == intervention.value.sapeur_id
  );
  return [
    // Début intervention
    {
      uuid: uuidv4(),
      date: intervention.value.date_debut,
      type: EventType.Info,
      titre: "Début de l'intervention",
      description: intervention.value.objet,
      auteur: chefIntervention
        ? chefIntervention?.nom + " " + chefIntervention?.prenom
        : null,
    },

    // Appels
    ...intervention.value.appels.map((a) => ({
      ...a,
      uuid: a.localUuid,
      type: EventType.Appel,
      titre: a.nom + " (" + a.numero + ")",
      description: a.commentaire,
      auteur: null,
    })),

    // Début de mission
    ...missions.map((m) => ({
      ...m,
      uuid: m.localUuid,
      date: m.date_debut,
      type: !m.date_fin ? EventType.OngoingMission : EventType.EndedMission,
      description: m.resume,
      auteur: m.sapeur?.designation,
    })),
    // Fin de mission
    ...missions
      .filter((m) => m.date_fin)
      .map((m) => ({
        ...m,
        uuid: m.localUuid,
        date: m.date_fin,
        type:
          m.date_fin == null
            ? EventType.OngoingMission
            : EventType.EndedMission,
        description: m.resume,
        auteur: m.sapeur?.designation,
      })),
  ].sort((a, b) =>
    DateTime.fromSQL(b.date).diff(DateTime.fromSQL(a.date)).toMillis()
  ) as Event[];
});

const openEvent = async (event: Event) => {
  if (intervention.value.localStatus == "validated") {
    return;
  }
  switch (event.type) {
    case EventType.Appel:
      {
        const appel = intervention.value.appels.find(
          (a) => a.localUuid == event.uuid
        );
        const modalAppel = await modalController.create({
          component: ModalAppelEditVue,
          componentProps: {
            appel: { ...appel },
          },
        });

        await modalAppel.present();
      }
      break;

    case EventType.EndedMission:
    case EventType.OngoingMission:
      router.push({ name: "mission", params: { uuid: event.uuid } });
      break;

    case EventType.Info:
    // Nothing
  }
};
</script>

<template>
  <ion-list>
    <ion-item>
      <ion-checkbox color="primary" slot="end" v-model="onlyPendingMissions"
        >Afficher uniquement les missions en cours</ion-checkbox
      >
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
      <div
        class="cd-timeline-content timeline-text positive"
        @click="openEvent(event)"
      >
        <h4 class="title">{{ event.titre }}</h4>
        <p class="date">
          {{ formatDate(event.date, "dd.LL.yy HH:mm") }}
          <span v-if="event.auteur">par {{ event.auteur }}</span>
        </p>
        <p class="description" v-if="event.description">
          {{ event.description }}
        </p>
      </div>
    </div>
  </section>
</template>

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
