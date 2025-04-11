<script lang="ts" setup>
import { IonSegment, IonSegmentButton } from "@ionic/vue";

import { usePresenceTab } from "../../store/usePresenceTabState";
import SubTabGroupe from "./SubTabGroupe.vue";
import SubTabQuittance from "./SubTabQuittance.vue";
import SubTabPresence from "./SubTabPresence.vue";

const { activeTab } = usePresenceTab();
</script>

<template>
  <div>
    <ion-segment v-model="activeTab">
      <ion-segment-button value="GROUPE">
        Groupes
      </ion-segment-button>
      <ion-segment-button value="SAPEUR">
        Sapeurs
      </ion-segment-button>
      <ion-segment-button value="QUITTANCE">
        Quittances
      </ion-segment-button>
    </ion-segment>
  </div>

  <div class="ion-padding-top">
    <div v-if="activeTab == 'GROUPE'">
      <sub-tab-groupe />
    </div>
    <div v-if="activeTab == 'SAPEUR'">
      <sub-tab-presence />
    </div>
    <div v-if="activeTab == 'QUITTANCE'">
      <sub-tab-quittance />
    </div>
  </div>
</template>

<style></style>
