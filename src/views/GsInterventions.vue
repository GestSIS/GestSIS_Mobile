<script lang="ts" setup>
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  modalController,
  loadingController,
  IonRow,
  IonCol,
  actionSheetController,
  IonSpinner,
} from "@ionic/vue";

import useInterventions from "@/store/useInterventions";
import useAlarmes from "@/store/useAlarmes";
import useDateFormatter from "@/tools/useDateFormatter";
import useActiveIntervention from "@/store/useActiveIntervention";
import { useRouter } from "vue-router";
import { Intervention } from "@/models/intervention";
import { Alarme } from "@/models/alarme";
import ModalInterventionCreateVue from "@/components/modals/ModalInterventionCreate.vue";
import ModalQuittancesVue from "@/components/modals/ModalQuittances.vue";
import useSapeurs from "@/store/useSapeurs";
import useGroupes from "@/store/useGroupes";
import useAuth from "@/store/useAuth";
import { DateTime } from "luxon";
// import { ref } from "vue";
import { useNotify } from "@/tools/useToast";
import { ref } from "vue";
const { formatDate } = useDateFormatter();

const { state: interventions } = useInterventions();
const { state: alarmes, sync } = useAlarmes();
const { activeSisKey } = useAuth();
const sapeursStore = useSapeurs();
const groupesStore = useGroupes();

const online = window.navigator.onLine;
if (online) {
  try {
    sapeursStore.sync().catch(() => {
      // TODO: See what to do
      console.log("Catch 1");
    });
    groupesStore.sync().catch(() => {
      // TODO: See what to do
      console.log("Catch 2");
    });
  } catch (error) {
    // TODO:
    console.log("Catch 3");
  }
}

const { updateIntervention } = useInterventions();
const { setActiveIntervention } = useActiveIntervention();

const router = useRouter();
const openDetails = async (intervention: Intervention) => {
  const loading = await loadingController.create({
    message: "Chargement...",
  });

  await loading.present();

  setActiveIntervention(intervention);

  router.push("intervention").then(() => {
    loading.dismiss();
  });
};

// const refreshTimer = ref();
const loading = ref(false);
const refresh = async () => {
  const online = window.navigator.onLine;
  if (online) {
    loading.value = true;
    sync()
      .then(() => (loading.value = false))
      .catch(() => (loading.value = false));
  } else {
    const { error } = useNotify();
    error("Pas de connexion internet");
    // TODO: Warning message not online
  }
};

const create = async (alarme: Alarme | null) => {
  if (alarme !== null) {
    // TODO:
    const intervention = new Intervention();
    const start = DateTime.fromISO(alarme.debut_alarme);
    start.set({ second: 0, minute: (start.minute / 15) * 15 });
    intervention.date_debut = start.toSQL({
      includeOffset: false,
    });
    intervention.description = alarme.description;
    intervention.lieu = alarme.address;
    // intervention.localite_id = alarme.address; // TODO:
    intervention.quittances = alarme.firefighters.map((s) => s.id);
    const groupesNumeros = new Set(
      alarme.groups
        .filter((g) => g.sis == activeSisKey.value)
        .map((g) => g.number)
    );
    intervention.groupes = groupesStore.state.value
      .filter((g) => g.no && groupesNumeros.has("" + g.no))
      .map((g) => g.id);

    // intervention.stat_federal_id = "TODO";
    // intervention.type_intervention_id = "TODO";
    intervention.degre =
      { BLEU: 2, JAUNE: 3, ROUGE: 4 }[alarme.couleur] ?? (null as any);
    setActiveIntervention(updateIntervention(intervention));
  } else {
    const modalIntervention = await modalController.create({
      component: ModalInterventionCreateVue,
      componentProps: {
        alarme,
      },
    });

    await modalIntervention.present();
    const { data } = await modalIntervention.onDidDismiss();

    const intervention = data;
    if (!intervention) {
      return;
    }
    setActiveIntervention(intervention);
  }
  router.push("intervention");
};

const showQuittances = async (alarme: Alarme) => {
  const modalQuittances = await modalController.create({
    component: ModalQuittancesVue,
    componentProps: {
      alarme,
    },
  });

  await modalQuittances.present();
};

const onAlarm = async (alarme: Alarme) => {
  const actionSheet = await actionSheetController.create({
    header: "Action",
    buttons: [
      {
        icon: "navigate",
        text: "Ouvrir google maps",
        role: "",
        handler: () => {
          if (
            !alarme.location_wgs84 ||
            alarme.location_wgs84.split(",").length !== 2
          ) {
            window.open("https://www.google.ch/maps");
          } else {
            window.open(
              "https://www.google.ch/maps/place/" +
                alarme.location_wgs84.split(",").reverse().join(",")
            );
          }
          return true;
        },
      },
      {
        icon: "add-circle",
        text: "Créer une intervention",
        handler: () => create(alarme),
      },
      {
        icon: "people",
        text: "Visualiser les quittances",
        handler: () => showQuittances(alarme),
      },
    ],
  });
  await actionSheet.present();
  await actionSheet.onDidDismiss();
};

const displayAlarmModule = true;
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="accueil"></ion-back-button>
        </ion-buttons>
        <ion-title>Rapports d'intervention</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list v-if="displayAlarmModule">
        <ion-item v-if="loading">
          <ion-label>Chargement des alarmes</ion-label>
          <ion-spinner name="circles"></ion-spinner
        ></ion-item>
        <ion-item v-if="!alarmes.length">Aucune alarme</ion-item>
        <ion-item
          :button="true"
          v-for="alarme in alarmes
            .filter((a) => a.couleur !== 'GRIS')
            .slice(alarmes.length - 5)"
          :key="alarme.id"
          @click.prevent="onAlarm(alarme)"
        >
          <ion-icon
            slot="start"
            name="warning-sharp"
            color="warning"
          ></ion-icon>
          <ion-icon slot="end" name="warning-sharp" color="warning"></ion-icon>
          <p>
            <span>{{ alarme.couleur }}</span> <span>{{ alarme.code }}</span> -
            <span class="details">{{ alarme.description }}</span>
            <br />
            <span class="details">{{ alarme.address }}</span>
          </p>
        </ion-item>
      </ion-list>

      <ion-row>
        <ion-col>
          <ion-button expand="full" @click="create(null)">
            <ion-icon slot="start" name="add"></ion-icon>Nouveau
          </ion-button>
        </ion-col>
        <ion-col v-if="displayAlarmModule">
          <ion-button expand="full" @click="refresh()">
            <ion-spinner
              v-if="loading"
              name="circles"
              slot="start"
            ></ion-spinner>
            <ion-icon v-else slot="start" name="sync"></ion-icon>Rafraîchir
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-list>
        <ion-item v-if="!interventions.length">Aucune intervention</ion-item>
        <ion-item
          :button="true"
          v-for="intervention in interventions"
          :key="intervention.id"
          @click.prevent="openDetails(intervention)"
        >
          <ion-icon
            slot="start"
            :name="
              intervention.localStatus == 'in_progress' ? 'create' : 'sync'
            "
          ></ion-icon>
          <p>
            {{ intervention.objet }} –
            {{ formatDate(intervention.date_debut, "dd.LL.yy HH:mm") }}
            <br />
            <span class="details">
              {{
                intervention.localStatus == "in_progress"
                  ? "En cours d'édition"
                  : "Validé, en attente de synchronisation"
              }}
            </span>
          </p>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
