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
  IonButton,
  IonGrid,
  IonCardContent,
  IonCard,
} from "@ionic/vue";
import {
  sync,
  alert as alertIcon,
  checkmarkCircle,
  warning,
} from "ionicons/icons";

import useDateFormatter from "../tools/useDateFormatter.ts";
import useStore from "../store/useStore.ts";
import { StoreState } from "../store/useBasicStore.ts";
import useAuth from "../store/useAuth.ts";
const { formatDate } = useDateFormatter();
const { modules, syncAll, syncModule } = useStore();
const { hasPermission } = useAuth();

const getSyncStatusIcon = (syncStatus: StoreState): string => {
  switch (syncStatus || StoreState.Synced) {
    case StoreState.Syncing:
      return sync;

    case StoreState.NeedSync:
      return alertIcon;

    case StoreState.Synced:
      return checkmarkCircle;

    // case StoreState.NeedSync:
    //   return warning;
    default:
      return warning;
  }
};

const getSyncStatusLabel = (syncStatus: StoreState): string => {
  switch (syncStatus || StoreState.Synced) {
    case StoreState.Syncing:
      return "En cours de synchronisation";

    case StoreState.NeedSync:
      return "Désynchronisée";

    case StoreState.Synced:
      return "Synchronisée";

    // case StoreState.NeedSync:
    //   return 'warning';
    default:
      return "Désynchronisée";
  }
};

const online = window.navigator.onLine;
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="{ name: 'accueil' }" />
        </ion-buttons>
        <ion-title>{{ $route.params.id }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card v-if="!online" color="warning">
        <ion-card-content>
          <ion-grid>
            <h2>⚠️ Aucune connexion internet détectée</h2>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <ion-button expand="full" color="primary" @click="syncAll">
        Tout synchroniser
      </ion-button>
      <ion-list>
        <ion-item
          v-for="{ name, lastSync, syncStatus, sync } in modules.filter(
            (m) => !m.permission || hasPermission(m.permission),
          )"
          :key="name"
          :button="true"
          @click="syncModule({ sync })"
        >
          <div>
            {{ name }}
            <br />
            <span class="details">{{
              lastSync.value
                ? formatDate(lastSync.value, "dd.MM.yyyy H:mm:ss")
                : "Pas encore synchronisé"
            }}</span>
          </div>
          <ion-icon
            slot="end"
            :icon="getSyncStatusIcon(syncStatus.value)"
            :aria-label="getSyncStatusLabel(syncStatus.value)"
          />
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
