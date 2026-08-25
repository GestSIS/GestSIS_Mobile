<script lang="ts" setup>
import { ref } from "vue";

import TabMateriel from "../components/intervention/TabMateriel.vue";
import TabVehicule from "../components/intervention/TabVehicule.vue";
import TabMission from "../components/intervention/TabMission.vue";
import TabAppel from "../components/intervention/TabAppel.vue";
import TabJalon from "../components/intervention/TabJalon.vue";
import TabPresence from "../components/intervention/TabPresence.vue";
import TabInfo from "../components/intervention/TabInfo.vue";
import TabJournal from "../components/intervention/TabJournal.vue";

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
import {
  list,
  body,
  call,
  car,
  construct,
  time,
  informationCircle,
  flag,
} from "ionicons/icons";

// Define tabs
const enum Tab {
  Journal = "Journal",
  Mission = "Mission",
  Appel = "Appel",
  Jalon = "Jalon",
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
          <ion-back-button default-href="interventions" />
        </ion-buttons>
        <ion-title>Rapport d'intervention</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-segment
      v-model="activeTab"
      :scrollable="true"
    >
      <ion-segment-button :value="Tab.Journal">
        <ion-icon
          :icon="list"
          aria-label="Journal d'intervention"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Mission">
        <ion-icon
          :icon="body"
          aria-label="Missions"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Jalon">
        <ion-icon
          :icon="flag"
          aria-label="Jalons"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Appel">
        <ion-icon
          :icon="call"
          aria-label="Appels"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Vehicule">
        <ion-icon
          :icon="car"
          aria-label="Véhicules"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Materiel">
        <ion-icon
          :icon="construct"
          aria-label="Matériels"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Presence">
        <ion-icon
          :icon="time"
          aria-label="Présences"
        />
      </ion-segment-button>
      <ion-segment-button :value="Tab.Info">
        <ion-icon
          :icon="informationCircle"
          aria-label="Informations"
        />
      </ion-segment-button>
    </ion-segment>

    <ion-content class="padding">
      <div>
        <div v-if="activeTab == Tab.Journal">
          <tab-journal />
        </div>
        <div v-if="activeTab == Tab.Mission">
          <tab-mission />
        </div>
        <div v-if="activeTab == Tab.Appel">
          <tab-appel />
        </div>
        <div v-if="activeTab == Tab.Jalon">
          <tab-jalon />
        </div>
        <div v-if="activeTab == Tab.Vehicule">
          <tab-vehicule />
        </div>
        <div v-if="activeTab == Tab.Materiel">
          <tab-materiel />
        </div>
        <div v-if="activeTab == Tab.Presence">
          <tab-presence />
        </div>
        <div v-if="activeTab == Tab.Info">
          <tab-info />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped></style>
