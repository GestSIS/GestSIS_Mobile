<script setup lang="ts">
import useAuth from "@/store/useAuth";
import useExercices from "@/store/useExercices";
import useInterventions from "@/store/useInterventions";
import useStore from "@/store/useStore";
import { useNotify } from "@/tools/useToast";
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
    interventionStore.state.value.map(i => i.localStatus).includes("validated") ||
    exerciceStore.state.value.map(e => e.localStatus).includes("validated")
  );
});

const sync = async () => {
  // Afficher loading
  const loading = await loadingController.create({
    message: 'Chargement...',
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
const authStore = useAuth();
const hasInterventionEditPermission = computed(() => authStore.activePermissions.value?.includes("intervention.modification"));
const hasExercicePresencePermission = computed(() => authStore.activePermissions.value?.includes("exercice.presence"));
</script>

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
                <ion-button ion-button color="light" block icon-start @click="sync">
                  <ion-icon slot="start" name="syncOutline"></ion-icon>Synchroniser maintenant
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <ion-grid>
        <ion-row>
          <ion-col size="6" v-if="hasInterventionEditPermission">
            <!-- v-if="user.hasRole('rapport_inter_all')"> -->
            <div class="tile" @click="navigateTo('interventions')">
              <div class="icon">
                <ion-icon name="flame" color="white"></ion-icon>
              </div>
              <p class="label">Rapports d'intervention</p>
            </div>
          </ion-col>
          <ion-col size="6" v-if="hasExercicePresencePermission">
            <!-- v-if="user.hasRole('presence_exe_all')"> -->
            <div class="tile" @click="navigateTo('exercices')">
              <div class="icon">
                <ion-icon name="checkbox" color="white"></ion-icon>
              </div>
              <p class="label">Présences exercices</p>
            </div>
          </ion-col>
          <ion-col size="6">
            <div class="tile" @click="navigateTo('synchronisation')">
              <div class="icon">
                <ion-icon name="sync" color="white"></ion-icon>
              </div>
              <p class="label">Synchronisation</p>
            </div>
          </ion-col>
          <ion-col size="6">
            <div class="tile" @click="navigateTo('parametres')">
              <div class="icon">
                <ion-icon name="settings" color="white"></ion-icon>
              </div>
              <p class="label">Paramètres</p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-col>div {
  background-color: #b90101;
  padding: 1px 5px;
}

ion-col>div>p:first-child {
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
  height: 100%;
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