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

import useDateFormatter from "@/tools/useDateFormatter";
import useStore from "@/store/useStore";
import { StoreState } from "@/store/useBasicStore";
import useAuth from "@/store/useAuth";
const { formatDate } = useDateFormatter();
const { modules, syncAll } = useStore();
const { activePermissions } = useAuth();

const getSyncStatusIcon = (syncStatus: StoreState): string => {
  switch (syncStatus || StoreState.Synced) {
    case StoreState.Syncing:
      return 'sync';

    case StoreState.NeedSync:
      return 'alert';

    case StoreState.Synced:
      return 'checkmark-circle';

    // case StoreState.NeedSync:
    //   return 'warning';
    default:
      return 'warning';
  }
}
</script>

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
          v-for="{ name, lastSync, syncStatus, sync } in modules.filter(m => !m.permission || activePermissions.includes(m.permission))"
          :key="name"
          @click="sync"
        >
          <div>
            {{ name }}
            <br />
            <span
              class="details"
            >{{ syncStatus ? formatDate(lastSync.value, 'dd.MM.yyyy H:mm:ss') : 'Pas encore synchronisé' }}</span>
          </div>
          <ion-icon :name="getSyncStatusIcon(syncStatus.value)" slot="end"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}

.icon.ion-md-alert,
.icon.ion-ios-alert {
  color: #da0101;
}

.icon.ion-md-checkmark-circle,
.icon.ion-ios-checkmark-circle {
  color: #01af01;
}

.icon.ion-md-warning,
.icon.ion-ios-warning {
  color: #ff8d00;
}
</style>