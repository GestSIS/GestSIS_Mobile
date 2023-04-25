<script lang="ts" setup>
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  modalController,
  loadingController,
  IonRow,
  IonCol,
} from "@ionic/vue";

import useInterventions from "@/store/useInterventions";
// import useAlarmes from "@/store/useAlarmes";
import useDateFormatter from "@/tools/useDateFormatter";
import useActiveIntervention from "@/store/useActiveIntervention";
import { useRouter } from "vue-router";
import { Intervention } from "@/models/intervention";
// import { Alarme } from "@/models/alarme";
import ModalInterventionCreateVue from "@/components/modals/ModalInterventionCreate.vue";
const { formatDate } = useDateFormatter();

const { state: interventions } = useInterventions();
// const { state: alarmes, sync } = useAlarmes();

// sync();

const { setActiveIntervention } = useActiveIntervention();

const router = useRouter();
const openDetails = async (intervention: Intervention) => {
  const loading = await loadingController.create({
    message: "Chargement...",
  });

  await loading.present();

  setActiveIntervention(intervention);

  router.push("intervention").then(() => {
    loading.dismiss();
  });
};

const refresh = async () => {
  const modalIntervention = await modalController.create({
    component: ModalInterventionCreateVue,
  });

  await modalIntervention.present();
  const { data } = await modalIntervention.onDidDismiss();

  const intervention = data;
  if (!intervention) {
    return;
  }

  setActiveIntervention(intervention);
  router.push("intervention");
};

const create = async () => {
  const modalIntervention = await modalController.create({
    component: ModalInterventionCreateVue,
  });

  await modalIntervention.present();
  const { data } = await modalIntervention.onDidDismiss();

  const intervention = data;
  if (!intervention) {
    return;
  }

  setActiveIntervention(intervention);
  router.push("intervention");
};

// const createFromAlarm = async (alarme: Alarme) => {
//   // TODO:
// };

const displayAlarmModule = false;
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="accueil"></ion-back-button>
        </ion-buttons>
        <ion-title>Rapports d'intervention</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- <ion-list v-if="displayAlarmModule">
        <ion-item v-if="!alarmes.length">Aucune alarme</ion-item>
        <ion-item
          :button="true"
          v-for="alarme in alarmes"
          :key="alarme.id"
          @click.prevent="createFromAlarm(alarme)"
        >
          <ion-icon slot="start" name="fire"></ion-icon>
          <p>
            TODO: Ajouter date, une fois disponible
            {{ alarme.address }}
            <br />
            <span class="details"></span>
          </p>
        </ion-item>
      </ion-list> -->

      <ion-row>
        <ion-col>
          <ion-button expand="full" @click="create()">
            <ion-icon slot="start" name="add"></ion-icon>Nouveau
          </ion-button>
        </ion-col>
        <ion-col v-if="displayAlarmModule">
          <ion-button expand="full" @click="refresh()">
            <ion-icon slot="start" name="sync"></ion-icon>Rafraîchir
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-list>
        <ion-item v-if="!interventions.length">Aucune intervention</ion-item>
        <ion-item
          :button="true"
          v-for="intervention in interventions"
          :key="intervention.id"
          @click.prevent="openDetails(intervention)"
        >
          <ion-icon
            slot="start"
            :name="
              intervention.localStatus == 'in_progress' ? 'create' : 'sync'
            "
          ></ion-icon>
          <p>
            {{ intervention.objet }} –
            {{ formatDate(intervention.date_debut, "dd.LL.yy HH:mm") }}
            <br />
            <span class="details">
              {{
                intervention.localStatus == "in_progress"
                  ? "En cours d'édition"
                  : "Validé, en attente de synchronisation"
              }}
            </span>
          </p>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
