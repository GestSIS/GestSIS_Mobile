<script lang="ts" setup>
import {
  IonText,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonIcon,
  modalController,
} from "@ionic/vue";

import { logIn, logOut, close, warning } from "ionicons/icons";

import useActiveIntervention from "../../store/useActiveIntervention";
import useSapeurs from "../../store/useSapeurs";
import useDateFormatter from "../../tools/useDateFormatter";
import { computed } from "vue";
import router from "../../router";
import ModalSapeurPresenceVue from "../modals/ModalSapeurPresence.vue";

const { formatDate } = useDateFormatter();

const { state, updatePresences } = useActiveIntervention();
const intervention = state;
intervention.value.sapeurs.sort((a, b) =>
  (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom)
);

const moduleSapeur = useSapeurs();

const sapeursAvecPresenceExercicesIncompletes = computed(() =>
  intervention.value.sapeurs.filter(
    (sap) =>
      sap.presences.filter(
        (pres) => pres.date_fin == null || pres.date_fin == ""
      ).length > 0
  )
);

const sapeursManquants = computed(() => {
  const sapeurIdsSaisi = new Set([
    ...intervention.value.missions.map((mission) => mission.sapeur.id),
    intervention.value.sapeur_id,
  ]);
  const sapeursIdPotentiel = new Set(
    intervention.value.sapeurs.map((sap) => sap.id)
  );
  const indexedSapeurs = new Map(
    moduleSapeur.state.value.map((s) => [s.id, s])
  );
  return [...sapeurIdsSaisi]
    .filter((id) => id && !sapeursIdPotentiel.has(id))
    .map((id) => indexedSapeurs.get(id) ?? null)
    .filter((s) => s);
});

const addMissingSapeur = (sapeurId: number) => {
  router.push({
    name: "sapeurs",
    params: { mode: "ARRIVEE" },
    query: { sapeursIds: sapeurId.toString() },
  });
};

const addPresenceExercice = (mode: "ARRIVEE" | "DEPART") => {
  router.push({ name: "sapeurs", params: { mode } });
};
const editPresenceExercice = async (
  sapeurIndex: number,
  presenceIndex: any
) => {
  const sapeur = intervention.value.sapeurs[sapeurIndex];
  if (!sapeur) {
    return;
  }

  const presence = {
    ...sapeur.presences[presenceIndex],
    sapeur_id: sapeur.id,
    nom: sapeur.nom,
    prenom: sapeur.prenom,
  };
  const modalEditPresence = await modalController.create({
    component: ModalSapeurPresenceVue,
    componentProps: presence,
  });

  await modalEditPresence.present();
  const { data } = await modalEditPresence.onDidDismiss();
  if (data) {
    sapeur.presences[presenceIndex] = {
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      piquet: false,
    };
  }

  // Update data in store
  updatePresences(intervention.value.sapeurs);
};

const removePresenceExercice = (sapeurIndex: number, presenceIndex: number) => {
  const sapeur = intervention.value.sapeurs[sapeurIndex];
  if (!sapeur) {
    return;
  }

  // Supprime le sapeur s'il n'a plus aucune présence
  if (sapeur.presences.length == 1) {
    intervention.value.sapeurs.splice(sapeurIndex, 1);
  } else {
    sapeur.presences.splice(presenceIndex, 1);
  }

  // Update data in store
  updatePresences(intervention.value.sapeurs);
};
</script>

<template>
  <ion-grid>
    <ion-row>
      <ion-col size="4">
        <h1>Présences</h1>
        <span v-if="intervention.sapeurs?.length" class="details"
          >{{ intervention.sapeurs?.length }} sapeurs</span
        >
        <span v-else class="details">Aucun sapeur</span>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          @click="addPresenceExercice('ARRIVEE')"
          :disabled="intervention.localStatus == 'validated'"
        >
          <ion-icon slot="start" :icon="logIn" aria-hidden="true"></ion-icon
          >Arrivée
        </ion-button>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          @click="addPresenceExercice('DEPART')"
          :disabled="sapeursAvecPresenceExercicesIncompletes.length == 0"
        >
          <ion-icon slot="start" :icon="logOut" aria-hidden="true"></ion-icon
          >Départ
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>

  <!-- Sapeurs dont il manque la présence -->
  <ion-item-group>
    <ion-item
      lines="full"
      v-for="(sapeur, i) of sapeursManquants"
      :key="i"
      @click="addMissingSapeur(sapeur.id ?? 0)"
      :disabled="intervention.localStatus == 'validated'"
    >
      <ion-icon
        color="warning"
        :icon="warning"
        slot="start"
        aria-label="Attention"
      ></ion-icon>
      <ion-text color="warning"
        >{{ sapeur.nom }} {{ sapeur.prenom }} - Présence manquante</ion-text
      >
    </ion-item>
  </ion-item-group>

  <!-- Présences des sapeurs -->
  <ion-item-group v-for="(sapeur, i) in intervention.sapeurs" :key="i">
    <ion-item-divider color="light"
      >{{ sapeur.nom }} {{ sapeur.prenom }}</ion-item-divider
    >
    <ion-item
      :button="true"
      v-for="(presence, j) in sapeur.presences"
      :key="j"
      @click="editPresenceExercice(i, j)"
      :disabled="intervention.localStatus == 'validated'"
    >
      <p>
        {{ formatDate(presence.date_debut, "HH:mm") }} -
        {{ presence.date_fin ? formatDate(presence.date_fin, "HH:mm") : "" }}
      </p>
      <ion-button
        @click.stop="removePresenceExercice(i, j)"
        :disabled="intervention.localStatus == 'validated'"
        fill="clear"
        color="dark"
        slot="end"
      >
        <ion-icon slot="icon-only" :icon="close" aria-label="fermer"></ion-icon>
      </ion-button>
    </ion-item>
  </ion-item-group>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
