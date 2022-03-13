<script lang="ts" setup>
import {
  IonList,
  IonText,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  modalController,
} from '@ionic/vue';

import useActiveIntervention from '@/store/useActiveIntervention';
import useGroupes from '@/store/useGroupes';
import useSapeurs from '@/store/useSapeurs';
import useDateFormatter from '@/tools/useDateFormatter';
import { ref, computed } from 'vue';
import { Sapeur } from '@/models/sapeur';
import router from '@/router';
import ModalSapeurPresenceVue from '../modals/ModalSapeurPresence.vue';

const { formatDate } = useDateFormatter();

// Define tabs
const enum Tab {
  Groupe,
  Sapeur
}

const activeTab = ref(Tab.Groupe);

const { state, updateGroupes, updatePresences } = useActiveIntervention();
const intervention = state;
intervention.value.sapeurs.sort((a, b) => (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom))

const moduleSapeur = useSapeurs();
const moduleGroupe = useGroupes();
const sapeurs = moduleSapeur.state;
const groupes = moduleGroupe.state;

const filteredGroupes = computed(() => groupes.value.filter(g => g.type == 1));
const groupesIntervention = ref(new Set(intervention.value.groupes));

const sapeursAvecPresenceExercicesIncompletes = computed(() =>
  intervention.value.sapeurs.filter(
    (sap) => sap.presences.filter((pres) => pres.date_fin == null || pres.date_fin == "").length > 0
  )
);

const sapeursSansPresenceExercices = computed(() => {
  const sapeursSaisi = intervention.value.missions.map((mission) => mission.sapeur);
  const sapeursIdPotentiel = new Set(intervention.value.sapeurs.map((sap) => sap.id));
  const sapeursExistant = new Set(sapeurs.value.map((sap) => sap.id));
  return sapeursSaisi.filter(
    (s) => !sapeursIdPotentiel.has(s.id) && sapeursExistant.has(s.id)
  );
});

const changeGroupeStatus = (groupeId: number) => {
  if (groupesIntervention.value.has(groupeId)) {
    groupesIntervention.value.delete(groupeId);
  } else {
    groupesIntervention.value.add(groupeId);
  }
  updateGroupes([...(groupesIntervention.value)]);
};

const addMissingSapeur = (sapeur: Sapeur) => {
  //TODO: add missing sapeur
}

const addPresenceExercice = (mode: 'ARRIVEE' | 'DEPART') => {
  router.push({ name: 'sapeurs', params: { mode } })
};
const editPresenceExercice = async (sapeurIndex: number, presenceIndex: any) => {
  const sapeur = intervention.value.sapeurs[sapeurIndex];
  if (!sapeur) {
    return;
  }

  const presence = {
    ...sapeur.presences[presenceIndex],
    sapeur_id: sapeur.id,
    nom: sapeur.nom,
    prenom: sapeur.prenom,
  }
  const modalEditPresence = await modalController
    .create({
      component: ModalSapeurPresenceVue,
      componentProps: presence
    })

  await modalEditPresence.present();
  let { data } = await modalEditPresence.onDidDismiss();
  if (data) {
    sapeur.presences[presenceIndex] = {
      date_debut: data.date_debut,
      date_fin: data.date_fin,
    }
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
  <div>
    <ion-segment v-model="activeTab">
      <ion-segment-button :value="Tab.Groupe">Groupes</ion-segment-button>
      <ion-segment-button :value="Tab.Sapeur">Sapeurs</ion-segment-button>
    </ion-segment>
  </div>

  <div class="ion-padding-top">
    <div v-if="activeTab == Tab.Groupe">
      <ion-list>
        <ion-item
          button
          v-for="(groupe, i) of filteredGroupes"
          :key="i"
          @click="changeGroupeStatus(groupe.id)"
          :disabled="!intervention.en_creation"
        >
          <!-- <span>{{ groupe.prefix }}</span> -->
          {{
            (groupe.no ? groupe.no + " - " : "") +
              groupe.designation
          }}
          <ion-icon
            slot="end"
            :name="
              groupesIntervention.has(groupe.id)
                ? 'checkmark-circle'
                : 'radio-button-off'
            "
          ></ion-icon>
        </ion-item>
      </ion-list>
    </div>

    <div v-if="activeTab == Tab.Sapeur">
      <ion-grid>
        <ion-row>
          <ion-col size="4">
            <h1>Présences</h1>
            <span
              v-if="intervention.sapeurs?.length"
              class="details"
            >{{ intervention.sapeurs?.length }} sapeurs</span>
            <span v-else class="details">Aucun sapeur</span>
          </ion-col>
          <ion-col size="4">
            <ion-button
              expand="block"
              @click="addPresenceExercice('ARRIVEE')"
              :disabled="!intervention.en_creation"
            >
              <ion-icon slot="start" name="log-in"></ion-icon>Arrivée
            </ion-button>
          </ion-col>
          <ion-col size="4">
            <ion-button
              expand="block"
              @click="addPresenceExercice('DEPART')"
              v-if="intervention.en_creation"
              :disabled="sapeursAvecPresenceExercicesIncompletes.length == 0"
            >
              <ion-icon slot="start" name="log-out"></ion-icon>Départ
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Sapeurs dont il manque la présence -->
      <ion-item-group>
        <ion-item
          lines="full"
          v-for="(sapeur, i) of sapeursSansPresenceExercices"
          :key="i"
          @click="addMissingSapeur(sapeur)"
        >
          <ion-icon color="warning" name="warning" slot="start"></ion-icon>
          <ion-text color="warning">{{ sapeur.nom }} {{ sapeur.prenom }} - Présence manquante</ion-text>
        </ion-item>
      </ion-item-group>

      <!-- Présences des sapeurs -->
      <ion-item-group v-for="(sapeur, i) in intervention.sapeurs" :key="i">
        <ion-item-divider color="light">{{ sapeur.nom }} {{ sapeur.prenom }}</ion-item-divider>
        <ion-item
          :button="true"
          v-for="(presence, j) in sapeur.presences"
          :key="j"
          :disabled="!intervention.en_creation"
          @click="editPresenceExercice(i, j)"
        >
          <p>
            {{ formatDate(presence.date_debut, "HH:mm") }} -
            {{ presence.date_fin ? formatDate(presence.date_fin, "HH:mm") : "" }}
          </p>
          <ion-button
            @click.stop="removePresenceExercice(i, j)"
            fill="clear"
            color="dark"
            slot="end"
          >
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-item-group>
    </div>
  </div>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>