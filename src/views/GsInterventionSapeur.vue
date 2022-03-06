<script lang="ts" setup>
import { Ref, ref, reactive, normalizeClass, defineProps } from "vue";
import {
  IonPage,
  IonRow,
  IonCol,
  IonModal,
  IonText,
  IonGrid,
  IonCheckbox,
  IonTitle,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonList,
  IonLabel,
  IonDatetime,
  IonContent,
  IonButton,
  IonItem,
  IonBackButton,
  modalController,
  IonIcon
} from '@ionic/vue';

import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "@/store/useActiveIntervention";
import useGroupes from "@/store/useGroupes";
import useSapeurs from "@/store/useSapeurs";
import useDateFormatter from "@/tools/useDateFormatter";
import { DateTime } from "luxon";
import ModalSapeurSelectVue from "@/components/modals/ModalSapeurSelect.vue";
import { Intervention } from "@/models/intervention";
import { Sapeur } from "@/models/sapeur";

const openModal = ref(false);
const router = useRouter();
const route = useRoute();
const { formatDate } = useDateFormatter();

const mode = route.params.mode as "ARRIVEE" | "DEPART";
interface Presences {
  date: string,
  mode: "ARRIVEE" | "DEPART",
  sapeurs: Array<{
    nom: string,
    prenom: string,
    id: number,
    selected: boolean
  }>
}

// Load needed data from active Intervention
const { state, addSapeursArrival, addSapeursDeparture } = useActiveIntervention();
const groupeModule = useGroupes();
const sapeurModule = useSapeurs();

// Init date with current date rounded to nearest quarter
const date = DateTime.now();
date.set({ minute: date.minute + (15 - date.minute % 15) });

// TODO: load presences that fix ARRIVEE or DEPART
let sapeurs: Presences["sapeurs"] = [];
let exceptSapeursIds = [];
if (mode == "ARRIVEE") {
  const exceptSapeursId = new Set(state.value.sapeurs
    .filter(s => s.presences.filter(p => p.date_fin == null || p.date_fin == "").length > 0)
    .map(s => s.id));
  const selectedGroupes = new Set(state.value.groupes);
  let potentialsSapeursIds = new Set<number>();
  groupeModule.state.value
    .filter(g => selectedGroupes.has(g.id))
    .forEach(g => g.sapeur_ids.forEach(s => potentialsSapeursIds.add(s as number)));
  potentialsSapeursIds = new Set([...potentialsSapeursIds].filter(s => !exceptSapeursId.has(s)));

  sapeurs = sapeurModule.state.value
    .filter(s => potentialsSapeursIds.has(s.id))
    .map(s => ({ ...s, selected: false }));
} else if (mode == "DEPART") {
  sapeurs = state.value.sapeurs
    .filter(s => s.presences.filter(p => p.date_fin == null || p.date_fin == "").length > 0)
    .map(s => ({ ...s, selected: true }))
}

const presences: Presences = reactive({ date: date.toISO(), sapeurs, mode });

const title = route.params.mission ? "Détail mission" : "Nouvelle mission";

const addSapeurs = async () => {
  const modalSapeurSelect = await modalController
    .create({
      component: ModalSapeurSelectVue,
      componentProps: {
        exceptSapeurIds: [],
        multiSelect: true,
      }
    })

  await modalSapeurSelect.present();
  let { data } = await modalSapeurSelect.onDidDismiss();

  if (!data) {
    return;
  }

  const ids = new Set(data);
  const sapeurs = sapeurModule.state.value.filter(s => ids.has(s.id));
  presences.sapeurs = [
    ...presences.sapeurs,
    ...sapeurs.map(s => ({ nom: s.nom, prenom: s.prenom, id: s.id, selected: true }))
  ].sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));
}

const save = () => {
  if (mode == 'ARRIVEE') {
    addSapeursArrival(presences);
  } else {
    addSapeursDeparture(presences)
  }
  router.back();
}
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'intervention' }"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          <ion-button slot="end" @click="save()">Valider</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content padding>
      <ion-list>
        <ion-item @click="openModal = !openModal">
          <ion-label>Heure {{ mode == 'ARRIVEE' ? "d'arrivée" : 'de départ' }}</ion-label>
          <ion-text
            slot="end"
            id="open-modal"
          >{{ presences.date ? formatDate(presences.date, 'dd.LL.yy HH:mm') : '' }}</ion-text>
          <ion-button fill="clear" slot="end">
            <ion-icon slot="end" name="calendar" />
          </ion-button>
          <ion-modal :is-open="openModal">
            <ion-datetime
              presentation="time-date"
              minuteValues="0,15,30,45"
              :value="DateTime.fromSQL(presences.date).toISO()"
              @ionChange="(ev: any) => presences.date = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
            />
          </ion-modal>
        </ion-item>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col size="8">
            <h3>Sapeurs</h3>
          </ion-col>
          <ion-col v-if="mode == 'ARRIVEE'" size="4">
            <ion-button expand="block" @click="addSapeurs()">
              Autres sapeurs
              <ion-icon name="add" slot="start"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list>
        <ion-item v-for="sapeur of presences.sapeurs" :key="sapeur.id">
          <ion-checkbox v-model="sapeur.selected" class="ion-margin-end"></ion-checkbox>
          <ion-label>{{ sapeur.nom }} {{ sapeur.prenom }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style>
</style>