<script setup lang="ts">
import useAuth from "../store/useAuth";
import useExercices from "../store/useExercices";
import useInterventions from "../store/useInterventions";
import useStore from "../store/useStore";
import { useNotify } from "../tools/useToast";
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
  loadingController,
} from "@ionic/vue";

import {
  flame,
  checkbox,
  call,
  sync as syncIcon,
  syncOutline,
  settings,
  // shirt,
} from "ionicons/icons";

import { computed } from "vue";
import { useRouter } from "vue-router";

const exerciceStore = useExercices();
const interventionStore = useInterventions();
const notify = useNotify();

const router = useRouter();
const navigateTo = async (name: string) => {
  router.push(name);
};

const needSync = computed((): boolean => {
  return (
    interventionStore.state.value
      .map((i) => i.localStatus)
      .includes("validated") ||
    exerciceStore.state.value.map((e) => e.localStatus).includes("validated")
  );
});

const sync = async () => {
  // Afficher loading
  const loading = await loadingController.create({
    message: "Chargement...",
  });

  await loading.present();

  // Load data
  const store = useStore();
  try {
    await store.syncAll();
  } catch (e: any) {
    // Catch Refresh token expired
    if (e?.status === 401) {
      notify.error("Vous avez été déconnecté pour cause d'absence prolongée.");
    }
  }

  // Hide loading
  await loading.dismiss();
};

// Permissions checks
const { hasPermission } = useAuth();
const hasInterventionEditPermission = computed(() =>
  hasPermission("intervention.modification")
);
const hasExercicePresencePermission = computed(() =>
  hasPermission("exercice.presence")
);
// const hasMaterielEditPermission = computed(() =>
//   hasPermission("mat_perso.modification")
// );
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>GestSIS Mobile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-card
        v-if="needSync"
        color="warning"
      >
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col
                col-12
                col-md-8
              >
                <h2>⚠️ Certains éléments ne sont pas synchronisés.</h2>
              </ion-col>
              <ion-col
                col-12
                col-md-4
              >
                <ion-button
                  ion-button
                  color="light"
                  block
                  icon-start
                  @click="sync"
                >
                  <ion-icon
                    slot="start"
                    :icon="syncOutline"
                    aria-hidden="true"
                  />Synchroniser maintenant
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <ion-grid>
        <ion-row>
          <ion-col
            v-if="hasInterventionEditPermission"
            size="6"
          >
            <ion-button
              class="tile"
              expand="full"
              @click="navigateTo('interventions')"
            >
              <div class="icon">
                <ion-icon
                  :icon="flame"
                  color="white"
                  aria-hidden="true"
                />
                <p class="label">
                  Rapports d'intervention
                </p>
              </div>
            </ion-button>
          </ion-col>
          <ion-col
            v-if="hasExercicePresencePermission"
            size="6"
          >
            <ion-button
              class="tile"
              expand="full"
              @click="navigateTo('exercices')"
            >
              <div class="icon">
                <ion-icon
                  :icon="checkbox"
                  color="white"
                  aria-hidden="true"
                />
                <p class="label">
                  Présences exercices
                </p>
              </div>
            </ion-button>
          </ion-col>
          <ion-col
            v-if="hasInterventionEditPermission"
            size="6"
          >
            <ion-button
              class="tile"
              expand="full"
              @click="navigateTo('annuaire')"
            >
              <div class="icon">
                <ion-icon
                  :icon="call"
                  color="white"
                  aria-hidden="true"
                />
                <p class="label">
                  Annuaire
                </p>
              </div>
            </ion-button>
          </ion-col>
          <!-- <ion-col size="6" v-if="hasMaterielEditPermission">
            <ion-button
              class="tile"
              expand="full"
              @click="navigateTo('materiel')"
            >
              <div class="icon">
                <ion-icon
                  :icon="shirt"
                  color="white"
                  aria-hidden="true"
                ></ion-icon>
                <p class="label">Matériel</p>
              </div>
            </ion-button>
          </ion-col> -->
          <ion-col size="6">
            <ion-button
              class="tile"
              expand="full"
              @click="navigateTo('synchronisation')"
            >
              <div class="icon">
                <ion-icon
                  :icon="syncIcon"
                  color="white"
                  aria-hidden="true"
                />
                <p class="label">
                  Synchronisation
                </p>
              </div>
            </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button
              class="tile"
              expand="full"
              @click="navigateTo('parametres')"
            >
              <div class="icon">
                <ion-icon
                  :icon="settings"
                  color="white"
                  aria-hidden="true"
                />
                <p class="label">
                  Paramètres
                </p>
              </div>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

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
  text-transform: none;
}

.tile .icon ion-icon {
  font-size: 5em;
}

.tile .label {
  font-size: 1.3em;
}

@media screen and (max-width: 400px) {
  .tile .label {
    min-height: 2.4em;
  }
}
</style>
