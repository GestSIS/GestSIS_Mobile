<script lang="ts" setup>
import { reactive } from "vue";
import {
  IonPage,
  IonRow,
  IonCol,
  IonGrid,
  IonCheckbox,
  IonTitle,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  IonBackButton,
  modalController,
  IonIcon,
} from "@ionic/vue";
import { add } from "ionicons/icons";

import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "../store/useActiveIntervention.ts";
import useGroupes from "../store/useGroupes.ts";
import useSapeurs from "../store/useSapeurs.ts";
import { DateTime } from "luxon";
import ModalSapeurSelectVue from "../components/modals/ModalSapeurSelect.vue";
import BaseDatetime from "../components/base/BaseDatetime.vue";

const router = useRouter();
const route = useRoute();

const mode = route.params.mode as "ARRIVEE" | "DEPART";
const sapeursIds = new Set(
  ((route.query?.sapeursIds as string) ?? "")
    .split(",")
    .map((e) => parseInt(e))
    .filter((e) => e),
);

interface Presences {
  date: string;
  mode: "ARRIVEE" | "DEPART";
  sapeurs: Array<{
    nom: string;
    prenom: string;
    id: number;
    selected: boolean;
  }>;
}

// Load needed data from active Intervention
const { state, addSapeursArrival, addSapeursDeparture } =
  useActiveIntervention();
const groupeModule = useGroupes();
const sapeurModule = useSapeurs();

// Init date with current date rounded to nearest quarter
let date: DateTime | null = null;
if (mode == "ARRIVEE") {
  // Défault à date de début d'intervention
  date = DateTime.fromSQL(state.value.date_debut ?? "");
  date = date.set({
    minute: date.minute - (date.minute % 15),
    second: 0,
    millisecond: 0,
  });
} else {
  // Défault à heure actuelle
  date = DateTime.now();
  date = date.set({
    minute: date.minute + 15 - (date.minute % 15),
    second: 0,
    millisecond: 0,
  });
}

// load presences that fit ARRIVEE or DEPART
let sapeurs: Presences["sapeurs"] = [];
let exceptSapeursIds = new Set<number>(
  // Filter out politique
  sapeurModule.state.value.filter((s) => s.type !== 0).map((s) => s.id),
);

if (mode == "ARRIVEE") {
  if (sapeursIds.size > 0) {
    // Uniquement les sapeurs passé en paramètre par défault
    sapeurs = sapeurModule.state.value
      .filter((s) => sapeursIds.has(s.id))
      .map((s) => ({ ...s, selected: true }));
  } else {
    // Uniquement les sapeurs dans les groupes sélectionnés par défault
    exceptSapeursIds = new Set([
      ...exceptSapeursIds,
      ...state.value.sapeurs
        .filter(
          (s) =>
            s.presences.filter((p) => p.date_fin == null || p.date_fin == "")
              .length > 0,
        )
        .map((s) => s.id),
    ]);

    const selectedGroupes = new Set(state.value.groupes);
    let potentialsSapeursIds = new Set<number>();
    groupeModule.state.value
      .filter((g) => selectedGroupes.has(g.id))
      .forEach((g) =>
        g.sapeur_ids.forEach((s) => potentialsSapeursIds.add(s.sapeur_id)),
      );
    potentialsSapeursIds = new Set(
      [...potentialsSapeursIds].filter((s) => !exceptSapeursIds.has(s)),
    );

    sapeurs = sapeurModule.state.value
      .filter((s) => potentialsSapeursIds.has(s.id))
      .map((s) => ({ ...s, selected: false }));
  }
} else if (mode == "DEPART") {
  sapeurs = state.value.sapeurs
    .filter(
      (s) =>
        s.presences.filter((p) => p.date_fin == null || p.date_fin == "")
          .length > 0,
    )
    .map((s) => ({ ...s, selected: true }));
}

sapeurs.sort((a, b) =>
  (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom),
);
const presences: Presences = reactive({
  date: date.toSQL({ includeOffset: false })?.slice(0, 16) ?? "",
  sapeurs,
  mode,
});

const addSapeurs = async () => {
  // Les sapeurs déjà présents dans la liste (pré-remplis par groupe ou
  // ajoutés lors d'un précédent appel) ne doivent pas pouvoir être
  // re-sélectionnés, sous peine de doublons.
  const alreadyPresentIds = new Set(presences.sapeurs.map((s) => s.id));
  const modalSapeurSelect = await modalController.create({
    component: ModalSapeurSelectVue,
    componentProps: {
      exceptSapeurIds: [...exceptSapeursIds, ...alreadyPresentIds],
      multiSelect: true,
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  if (!data) {
    return;
  }

  const ids = new Set<number>(data);
  const sapeurs = sapeurModule.state.value.filter(
    (s) => ids.has(s.id) && !alreadyPresentIds.has(s.id),
  );
  presences.sapeurs = [
    ...presences.sapeurs,
    ...sapeurs.map((s) => ({
      nom: s.nom,
      prenom: s.prenom,
      id: s.id,
      selected: true,
    })),
  ].sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));
};

const save = () => {
  if (mode == "ARRIVEE") {
    addSapeursArrival(presences);
  } else {
    addSapeursDeparture(presences);
  }
  router.back();
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="{ name: 'intervention' }" />
        </ion-buttons>
        <ion-title>Présences</ion-title>

        <ion-buttons slot="end">
          <ion-button slot="end" @click="save()"> Valider </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <base-datetime
          v-model="presences.date"
          :per-quarter="true"
          :clearable="mode == 'DEPART'"
        >
          Heure
          {{ mode == "ARRIVEE" ? "d'arrivée" : "de départ" }}
        </base-datetime>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col size="8">
            <h3>Sapeurs</h3>
          </ion-col>
          <ion-col v-if="mode == 'ARRIVEE'" size="4">
            <ion-button expand="block" @click="addSapeurs">
              <ion-icon slot="start" :icon="add" aria-hidden="true" />
              Autres sapeurs
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list>
        <ion-item v-for="sapeur of presences.sapeurs" :key="sapeur.id">
          <ion-checkbox v-model="sapeur.selected" class="ion-margin-end">
            {{ sapeur.nom }} {{ sapeur.prenom }}
          </ion-checkbox>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style></style>
