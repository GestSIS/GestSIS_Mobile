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
  IonLabel,
  IonBadge,
} from "@ionic/vue";
import {
  create as createIcon,
  sync,
  warningSharp,
  add,
  addCircle,
  people,
  navigate,
} from "ionicons/icons";

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
import { computed, ref } from "vue";
import useStore from "@/store/useStore";
const { formatDate } = useDateFormatter();

const { state: interventions } = useInterventions();
const { activeSisKey } = useAuth();
const alarmeStore = useAlarmes();
const sapeursStore = useSapeurs();
const groupesStore = useGroupes();

const online = window.navigator.onLine;
if (online) {
  Promise.all([
    sapeursStore.sync(),
    groupesStore.sync(),
    alarmeStore.sync(),
  ]).catch(() => {
    // Caught exception
  });
}

// const refreshTimer = ref();
const loading = ref(false);
const refreshAlarmes = async () => {
  const { syncModule } = useStore();
  loading.value = true;
  await syncModule({ sync: alarmeStore.forcedSync });
  loading.value = false;
};

const filteredAlarmes = computed(() =>
  alarmeStore.state.value
    .filter((a) => a.couleur !== "GRIS")
    .filter((a) => DateTime.fromISO(a.debut_alarme).diffNow("days").days >= -7)
);

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

const create = async (alarme: Alarme | null) => {
  if (alarme !== null) {
    const intervention = new Intervention();
    intervention.objet = alarme.description;
    intervention.alarme = alarme;
    intervention.wgs84 = alarme.location_wgs84;
    intervention.quittances = [
      ...new Set(
        alarme.firefighters
          .filter((f) => f.sis == activeSisKey.value)
          .map((f) => f.id)
      ),
    ];

    const start = DateTime.fromISO(alarme.debut_alarme);
    start.set({ second: 0, minute: (start.minute / 15) * 15 });
    intervention.date_debut =
      start.toSQL({
        includeOffset: false,
      }) ?? "";
    intervention.description = alarme.description;
    intervention.lieu = alarme.address;
    // intervention.localite_id = alarme.address; // TODO: parse localité
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
        icon: navigate,
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
        icon: addCircle,
        text: "Créer une intervention",
        handler: () => create(alarme),
      },
      {
        icon: people,
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
        <ion-item v-if="!loading && !filteredAlarmes.length"
          >Aucune alarme</ion-item
        >
        <ion-item
          :button="true"
          v-for="alarme in filteredAlarmes"
          :key="alarme.id"
          @click.prevent="onAlarm(alarme)"
        >
          <ion-icon
            slot="start"
            :icon="warningSharp"
            color="warning"
            aria-label="Attention"
          ></ion-icon>
          <ion-icon
            slot="end"
            :icon="warningSharp"
            color="warning"
            aria-hidden="true"
          ></ion-icon>
          <p>
            <span>{{ alarme.couleur }}</span> <span>{{ alarme.code }}</span> -
            <span class="details">{{ alarme.description }}</span>
            <br />
            <span class="details">{{ alarme.address }}</span>
            <br />
            <span>
              <ion-badge
                >{{
                  alarme.firefighters.filter((f) => f.sis === activeSisKey)
                    .length +
                  alarme.unresolved.filter((f) => f.sis == activeSisKey).length
                }}
                quittances</ion-badge
              >
            </span>
          </p>
        </ion-item>
      </ion-list>

      <ion-row>
        <ion-col>
          <ion-button expand="full" @click="create(null)">
            <ion-icon slot="start" :icon="add" aria-hidden="true"></ion-icon
            >Nouveau
          </ion-button>
        </ion-col>
        <ion-col v-if="displayAlarmModule">
          <ion-button expand="full" @click="refreshAlarmes()">
            <ion-spinner
              v-if="loading"
              name="circles"
              slot="start"
            ></ion-spinner>
            <ion-icon
              v-else
              slot="start"
              :icon="sync"
              aria-hidden="true"
            ></ion-icon
            >Rafraîchir
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
          :disabled="loading"
        >
          <ion-icon
            slot="start"
            :icon="
              intervention.localStatus == 'in_progress' ? createIcon : sync
            "
            :aria-label="
              intervention.localStatus == 'in_progress'
                ? 'Créer'
                : 'Synchroniser'
            "
          ></ion-icon>
          <p>
            {{ intervention.objet }} –
            {{ formatDate(intervention.date_debut ?? "", "dd.LL.yy HH:mm") }}
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
