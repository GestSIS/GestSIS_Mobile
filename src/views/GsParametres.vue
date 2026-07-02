<script lang="ts" setup>
import useAuth from "../store/useAuth.ts";
import useExercices from "../store/useExercices.ts";
import useInterventions from "../store/useInterventions.ts";
import useStore from "../store/useStore.ts";
import { useTheme } from "../hooks/useTheme.ts";
import { useNotify } from "../tools/useToast.ts";
import {
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonSelect,
  IonSelectOption,
  loadingController,
  alertController,
} from "@ionic/vue";
import { personOutline, flame, contrastOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";

const { switchTheme, activeTheme } = useTheme();
const router = useRouter();
const notify = useNotify();

const { state, activeSisKey, logout, selectSis, allSis, loadAllSis } =
  useAuth();

// Pour un admin : tous les SIS du système (chargés via /sis).
// Sinon : uniquement les SIS de l'utilisateur (clés api_key déjà locales).
const sisOptions = computed(() => {
  if (state.data.admin && allSis.value.length > 0) {
    return allSis.value
      .map((s) => ({ key: s.api_key, label: s.nom }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  return state.data.sis.map((key) => ({ key, label: key }));
});

onMounted(() => {
  // Charge la liste complète des SIS pour les admins (no-op sinon).
  loadAllSis();
});

const wrappedLogout = () => {
  logout();
  router.push({ name: "login" });
};

const onSelectSis = async (sis: string) => {
  // Check if some exercices/interventions need to be synced if so then confirm that the modifications will be lost
  const exerciceStore = useExercices();
  const interventionStore = useInterventions();
  const hasInProgressExercices = exerciceStore.state.value.some(
    (e) => e.localStatus == "in_progress",
  );
  const hasInProgressInterventions = interventionStore.state.value.some(
    (e) => e.localStatus == "in_progress",
  );

  if (hasInProgressExercices || hasInProgressInterventions) {
    const confirm = await alertController.create({
      header: "Perte de données",
      message:
        "Attention, des exercices ou interventions sont en cours de saisie, êtes-vous sûr de vouloir changer de SIS ? Les données des exercices et interventions en cours de saisie seront perdues ! Cette action est irréversible.",
      buttons: [
        {
          text: "Non",
          role: "cancel",
        },
        {
          text: "Oui",
          role: "confirm",
        },
      ],
    });

    await confirm.present();
    const { role } = await confirm.onDidDismiss();
    if (role !== "confirm") {
      return;
    }
  }

  // Switch SIS
  const ok = await selectSis(sis);
  if (!ok) {
    notify.error("Impossible de changer de SIS");
    return;
  }

  // Afficher loading
  const loading = await loadingController.create({
    message: "Chargement...",
  });

  await loading.present();

  // Load data
  const store = useStore();
  try {
    await store.syncAll();
  } catch (e: unknown) {
    // Catch Refresh token expired
    if ((e as { status?: number })?.status === 401) {
      notify.error("Vous avez été déconnecté pour cause d'absence prolongée.");
    }
  }

  // Hide loading
  await loading.dismiss();
};
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
      <ion-list lines="none">
        <ion-item v-if="sisOptions.length > 1">
          <ion-icon slot="start" :icon="flame" aria-hidden="true" />
          <ion-select
            label="Sis"
            :value="activeSisKey"
            @ion-change="onSelectSis($event.target.value)"
          >
            <ion-select-option
              v-for="opt in sisOptions"
              :key="opt.key"
              :value="opt.key"
            >
              {{ opt.label }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <!-- <ion-avatar slot="start">
            <img v-if="state.data.photo" :src="user.photo" />
          </ion-avatar> -->
          <ion-icon slot="start" :icon="personOutline" aria-hidden="true" />
          <ion-label>
            {{ state.data.pseudo }}
            -
            {{ state.data.email }}
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" :icon="contrastOutline" aria-hidden="true" />
          <ion-select
            label="Thème"
            :value="activeTheme"
            @ion-change="switchTheme($event.target.value)"
          >
            <ion-select-option key="dark" value="dark">
              Sombre
            </ion-select-option>
            <ion-select-option key="light" value="light">
              Clair
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="full" @click="wrappedLogout">
          Déconnexion
        </ion-button>
      </ion-list>
    </ion-content>

    <ion-footer>
      <div class="ion-padding copyright">
        Version 2.6.8
        <br />Application créée par Bastien Wermeille <br />support@gestsis.ch
        <br />
        {{ new Date().getFullYear() }} © GestSIS, Tous droits réservés
      </div>
    </ion-footer>
  </ion-page>
</template>

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
