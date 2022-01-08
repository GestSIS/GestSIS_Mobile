<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>GestSIS Mobile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-card v-if="needSync" color="warning">
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col col-12 col-md-8>
                <h2>⚠️ Certains éléments ne sont pas synchronisés.</h2>
              </ion-col>
              <ion-col col-12 col-md-4>
                <ion-button
                  ion-button
                  color="light"
                  block
                  icon-start
                  @click="startSync"
                >
                  <ion-icon
                    slot="start"
                    :md="syncOutline"
                    :ios="syncOutline"
                  ></ion-icon
                  >Synchroniser maintenant
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <ion-grid>
        <ion-row>
          <ion-col size="6" col-sm-4>
            <!-- v-if="!user.hasRole('rapport_inter_all')"> -->
            <div class="tile" @click="showInterventions">
              <div class="icon">
                <ion-icon :md="flame" :ios="flame"></ion-icon>
              </div>
              <p class="label">Rapports d'intervention</p>
            </div>
          </ion-col>
          <ion-col size="6" col-sm-4>
            <!-- v-if="!user.hasRole('presence_exe_all')"> -->
            <div class="tile" @click="showExercices">
              <div class="icon">
                <ion-icon :md="checkbox" :ios="checkbox"></ion-icon>
              </div>
              <p class="label">Présences exercices</p>
            </div>
          </ion-col>
          <ion-col size="6" col-sm-4>
            <div class="tile" @click="showSync">
              <div class="icon">
                <ion-icon :md="sync" :ios="sync"></ion-icon>
              </div>
              <p class="label">Synchronisation</p>
            </div>
          </ion-col>
          <ion-col size="6" col-sm-4>
            <div class="tile" @click="showSettings">
              <div class="icon">
                <ion-icon :md="settings" :ios="settings"></ion-icon>
              </div>
              <p class="label">Paramètres</p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  flame,
  flameOutline,
  checkbox,
  sync,
  syncOutline,
  settings,
} from "ionicons/icons";

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCol,
  IonRow,
  IonCard,
  IonGrid,
  IonButton,
  IonIcon,
  IonCardContent,
} from "@ionic/vue";

export default {
  name: "GsHome",
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCol,
    IonRow,
    IonCard,
    IonGrid,
    IonButton,
    IonIcon,
    IonCardContent,
  },
  setup() {
    const needSync = () => {
      return true;
    };
    const startSync = () => {
      return true;
    };

    const showExercices = () => {
      return true;
    };
    const showInterventions = () => {
      return true;
    };
    const showSettings = () => {
      return true;
    };
    const showSync = () => {
      return true;
    };

    return {
      needSync,
      startSync,

      // Methods
      showExercices,
      showInterventions,
      showSettings,
      showSync,

      // Icons
      flame,
      flameOutline,
      checkbox,
      sync,
      syncOutline,
      settings,
    };
  },
};
</script>

<style scoped>
ion-col > div {
  background-color: #b90101;
  padding: 1px 5px;
}
ion-col > div > p:first-child {
  line-height: 60px;
}

.ctn-sync-status {
  background-color: #ffc83d;
}

.ctn-sync-status h2 {
  font-weight: bold;
  font-size: 1.8rem;
}

.tile {
  color: #fff;
  text-align: center;
}
.tile .icon {
  padding-top: 5px;
}
.tile .icon ion-icon {
  font-size: 5em;
}
.tile .label {
  font-size: 1.2em;
}

@media screen and (max-width: 400px) {
  .tile .label {
    min-height: 2.4em;
  }
}
</style>