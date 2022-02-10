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
        <ion-item v-if="!interventions.length">Aucun rapport d'intervention</ion-item>
        <ion-item
          :button="true"
          v-for="intervention in interventions"
          :key="intervention.id"
          @click.prevent="openDetails(intervention.localUuid)"
        >
          <ion-icon slot="start" :name="intervention.en_creation ? 'create' : 'create'"></ion-icon>
          <p>
            {{ intervention.objet }} –
            {{ formatDate(intervention.date_debut, "dd.LL.yy HH:mm") }}
            <br />
            <span class="details">
              {{
                intervention.en_creation
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
} from "@ionic/vue";

import { computed } from "vue";
import useDateFormatter from "@/tools/useDateFormatter";
import useActiveIntervention from "@/store/useActiveIntervention";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";
const { formatDate } = useDateFormatter();

const storeInterventions = useInterventions();
const interventions = computed(() => storeInterventions.state.liste);

const router = useRouter()
const openDetails = async (interventionUuid: string) => {
  // intervention: Intervention) {
  const { setActiveIntervention } = useActiveIntervention();
  const intervention = interventions.value.find(i => i.localUuid == interventionUuid);
  if (intervention != null) {
    setActiveIntervention(intervention);
    router.push('intervention');
  }
};

const create = async () => {
  //TODO: Change to open intervention creation
  const intervention = storeInterventions.newIntervention(DateTime.now(), "objet ...", 1, "Adresse à définir");
};
</script>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>