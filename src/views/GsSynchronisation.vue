<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'accueil' }"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ $route.params.id }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-button expand="full" color="light" @click="syncAll">Tout synchroniser</ion-button>
      <ion-list>
        <ion-item
          button="true"
          v-for="module in loadedModules"
          :key="module.name"
          @click="syncProvider(module)"
        >
          <div>
            {{ module.name }}
            <br />
            <span class="details">{{ module.lastSync ? (formatDate(module.lastSync, 'dd.MM.yyyy H:mm:ss')) : 'Pas encore synchronisé' }}</span>
          </div>
          <ion-icon :name="getSyncStatusIcon(module)" slot="end"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonItem,
  IonList,
  IonIcon,
  IonButton
} from "@ionic/vue";

import useDateFormatter from "@/tools/useDateFormater";
import useStore from "@/store/useStore";
const { formatDate } = useDateFormatter();
const { modules } = useStore();
const loadedModules = modules.map(m => m())

const enum SyncStatus {
  Syncing,
  NeverSync,
  OK,
  NeedSync
}

const getSyncStatusIcon = (module: any): string => {
  switch (module?.getSyncStatus || SyncStatus.Syncing) {
    case SyncStatus.Syncing:
      return 'sync';

    case SyncStatus.NeverSync:
      return 'alert';

    case SyncStatus.OK:
      return 'checkmark-circle';

    case SyncStatus.NeedSync:
      return 'warning';
    default:
      return '';
  }
}

const syncProvider = async (module: any) => {
  module.load();
}
const syncAll = () => {
  // TODO: 
}
</script>

<style scoped>
.details {
  color: var(--ion-color-medium);
}

.icon.ion-md-alert, .icon.ion-ios-alert {
  color: #da0101;
}

.icon.ion-md-checkmark-circle, .icon.ion-ios-checkmark-circle {
  color: #01af01;
}

.icon.ion-md-warning, .icon.ion-ios-warning {
  color: #ff8d00;
}
</style>