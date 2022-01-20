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
          v-for="module in modules"
          :key="module.name"
          @click="syncProvider(module)"
        >
          <h2>{{ module.name }}</h2>
          <p>{{ module.lastSync ? (formatDate(module.lastSync, 'dd.MM.yyyy H:mm:ss')) : 'Pas encore synchronisé' }}</p>
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
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>