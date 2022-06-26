<script lang="ts" setup>
import useInterventions from "@/store/useInterventions";
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
} from "@ionic/vue";

import useDateFormatter from "@/tools/useDateFormatter";
import useActiveIntervention from "@/store/useActiveIntervention";
import { useRouter } from "vue-router";
import { Intervention } from "@/models/intervention";
import ModalInterventionCreateVue from "@/components/modals/ModalInterventionCreate.vue";
const { formatDate } = useDateFormatter();

const { state } = useInterventions();
const { setActiveIntervention } = useActiveIntervention();

const router = useRouter()
const openDetails = async (intervention: Intervention) => {
  const loading = await loadingController.create({
    message: 'Chargement...',
  });

  await loading.present();

  setActiveIntervention(intervention);

  router.push('intervention').then(() => {
    loading.dismiss();
  });
};

const create = async () => {
  const modalIntervention = await modalController
    .create({
      component: ModalInterventionCreateVue,
    })

  await modalIntervention.present();
  const { data } = await modalIntervention.onDidDismiss();

  const intervention = data;
  if (!intervention) {
    return;
  }

  setActiveIntervention(intervention);
  router.push('intervention');
};
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
      <ion-button expand="full" @click="create()">
        <ion-icon slot="start" name="add"></ion-icon>Nouveau
      </ion-button>

      <ion-list>
        <ion-item v-if="!state.length">Aucune intervention</ion-item>
        <ion-item :button="true" v-for="intervention in state" :key="intervention.id"
          @click.prevent="openDetails(intervention)">
          <ion-icon slot="start" :name="intervention.localStatus == 'in_progress' ? 'create' : 'sync'"></ion-icon>
          <p>
            {{ intervention.objet }} –
            {{ formatDate(intervention.date_debut, "dd.LL.yy HH:mm") }}
            <br />
            <span class="details">
              {{
                  intervention.localStatus == 'in_progress'
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