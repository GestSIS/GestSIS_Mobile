<script lang="ts" setup>
import { ref } from "vue";

import TabMateriel from "@/components/intervention/TabMateriel.vue";
import TabVehicule from "@/components/intervention/TabVehicule.vue";
import TabMission from "@/components/intervention/TabMission.vue";
import TabAppel from "@/components/intervention/TabAppel.vue";
import TabPresence from "@/components/intervention/TabPresence.vue";
import TabInfo from "@/components/intervention/TabInfo.vue";
import TabJournal from "@/components/intervention/TabJournal.vue";

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";

// Define tabs
const enum Tab {
  Journal = "Journal",
  Mission = "Mission",
  Appel = "Appel",
  Vehicule = "Vehicule",
  Materiel = "Materiel",
  Presence = "Presence",
  Info = "Info",
}
const activeTab = ref(Tab.Journal);
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="interventions"></ion-back-button>
        </ion-buttons>
        <ion-title>Rapport d'intervention</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-segment v-model="activeTab">
      <ion-segment-button :value="Tab.Journal">
        <ion-icon name="list"></ion-icon>
      </ion-segment-button>
      <ion-segment-button :value="Tab.Mission">
        <ion-icon name="body"></ion-icon>
      </ion-segment-button>
      <ion-segment-button :value="Tab.Appel">
        <ion-icon name="call"></ion-icon>
      </ion-segment-button>
      <ion-segment-button :value="Tab.Vehicule">
        <ion-icon name="car"></ion-icon>
      </ion-segment-button>
      <ion-segment-button :value="Tab.Materiel">
        <ion-icon name="construct"></ion-icon>
      </ion-segment-button>
      <ion-segment-button :value="Tab.Presence">
        <ion-icon name="time"></ion-icon>
      </ion-segment-button>
      <ion-segment-button :value="Tab.Info">
        <ion-icon name="information-circle"></ion-icon>
      </ion-segment-button>
    </ion-segment>

    <ion-content class="padding">
      <div>
        <div v-if="activeTab == Tab.Journal">
          <tab-journal></tab-journal>
        </div>
        <div v-if="activeTab == Tab.Mission">
          <tab-mission></tab-mission>
        </div>
        <div v-if="activeTab == Tab.Appel">
          <tab-appel></tab-appel>
        </div>
        <div v-if="activeTab == Tab.Vehicule">
          <tab-vehicule></tab-vehicule>
        </div>
        <div v-if="activeTab == Tab.Materiel">
          <tab-materiel></tab-materiel>
        </div>
        <div v-if="activeTab == Tab.Presence">
          <tab-presence></tab-presence>
        </div>
        <div v-if="activeTab == Tab.Info">
          <tab-info></tab-info>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped></style>
