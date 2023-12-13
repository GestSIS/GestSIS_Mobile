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
} from "@ionic/vue";

import {
  checkmarkCircle,
  radioButtonOff,
  logIn,
  logOut,
  close,
  warning,
} from "ionicons/icons";

import useActiveIntervention from "@/store/useActiveIntervention";
import useGroupes from "@/store/useGroupes";
import useSapeurs from "@/store/useSapeurs";
import useDateFormatter from "@/tools/useDateFormatter";
import { ref, computed } from "vue";
import router from "@/router";
import ModalSapeurPresenceVue from "../modals/ModalSapeurPresence.vue";
import { usePresenceTab } from "@/store/usePresenceTabState";
import useAuth from "@/store/useAuth";

const { formatDate } = useDateFormatter();
const { activeTab } = usePresenceTab();

const { state, updateGroupes, updatePresences } = useActiveIntervention();
const intervention = state;
intervention.value.sapeurs.sort((a, b) =>
  (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom)
);

const moduleSapeur = useSapeurs();
const moduleGroupe = useGroupes();
const sapeurs = moduleSapeur.state;
const groupes = moduleGroupe.state;

const filteredGroupes = computed(() =>
  groupes.value
    .filter((g) => g.type == 1)
    .sort((a, b) => parseInt(`${a.no || 99}`) - parseInt(`${b.no || 99}`))
);
const groupesIntervention = ref(new Set(intervention.value.groupes));

const sapeursAvecPresenceExercicesIncompletes = computed(() =>
  intervention.value.sapeurs.filter(
    (sap) =>
      sap.presences.filter(
        (pres) => pres.date_fin == null || pres.date_fin == ""
      ).length > 0
  )
);

const sapeursSansPresenceExercices = computed(() => {
  const sapeursSaisi = [
    ...new Map(
      intervention.value.missions
        .filter((mission) => mission.sapeur.id)
        .map((mission) => mission.sapeur)
        .map((s) => [s.id, { ...s, type: 0 }])
    ).values(),
  ];
  const sapeursIdPotentiel = new Set(
    intervention.value.sapeurs.map((sap) => sap.id)
  );
  const sapeursExistant = new Set(sapeurs.value.map((sap) => sap.id));
  return sapeursSaisi.filter(
    (s) => s.id && !sapeursIdPotentiel.has(s.id) && sapeursExistant.has(s.id)
  );
});

const changeGroupeStatus = (groupeId: number) => {
  if (groupesIntervention.value.has(groupeId)) {
    groupesIntervention.value.delete(groupeId);
  } else {
    groupesIntervention.value.add(groupeId);
  }
  updateGroupes([...groupesIntervention.value]);
};

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

const { activeSisKey } = useAuth();
const groupeAlarmes =
  intervention.value.alarme?.groups
    ?.filter((g) => g.sis === activeSisKey.value)
    ?.sort((g1, g2) => g1.number.localeCompare(g2.number)) ?? [];
</script>

<template>
  <div>
    <ion-segment v-model="activeTab">
      <ion-segment-button value="GROUPE">Groupes</ion-segment-button>
      <ion-segment-button value="SAPEUR">Sapeurs</ion-segment-button>
      <ion-segment-button value="QUITTANCE">Quittances</ion-segment-button>
    </ion-segment>
  </div>

  <div class="ion-padding-top">
    <div v-if="activeTab == 'GROUPE'">
      <ion-list>
        <ion-item
          button
          v-for="(groupe, i) of filteredGroupes"
          :key="i"
          :disabled="intervention.localStatus == 'validated'"
          @click="changeGroupeStatus(groupe.id)"
        >
          <!-- <span>{{ groupe.prefix }}</span> -->
          {{ (groupe.no ? groupe.no + " - " : "") + groupe.designation }}
          <ion-icon
            slot="end"
            :icon="
              groupesIntervention.has(groupe.id)
                ? checkmarkCircle
                : radioButtonOff
            "
            aria-hidden="true"
          ></ion-icon>
        </ion-item>
      </ion-list>
    </div>

    <div v-if="activeTab == 'SAPEUR'">
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
              <ion-icon
                slot="start"
                :icon="logOut"
                aria-hidden="true"
              ></ion-icon
              >Départ
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
            >{{ sapeur.designation }} - Présence manquante</ion-text
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
            {{
              presence.date_fin ? formatDate(presence.date_fin, "HH:mm") : ""
            }}
          </p>
          <ion-button
            @click.stop="removePresenceExercice(i, j)"
            :disabled="intervention.localStatus == 'validated'"
            fill="clear"
            color="dark"
            slot="end"
          >
            <ion-icon
              slot="icon-only"
              :icon="close"
              aria-label="fermer"
            ></ion-icon>
          </ion-button>
        </ion-item>
      </ion-item-group>
    </div>

    <div v-if="activeTab == 'QUITTANCE'">
      <ion-item v-if="!intervention.alarme">Aucune quittance</ion-item>
      <ion-list v-if="intervention.alarme">
        <ion-item-group v-for="g in groupeAlarmes" :key="g.sis">
          <ion-item-divider>
            <ion-label
              >{{ g.sis.toUpperCase() }} : {{ g.number }} -
              {{ g.name }}</ion-label
            ><ion-badge slot="end"
              >{{
                intervention.alarme.firefighters.filter(
                  (f) => f.group_name == g.name
                ).length +
                intervention.alarme.unresolved.filter(
                  (f) => f.group_name == g.name
                ).length
              }}
              quittances</ion-badge
            >
          </ion-item-divider>
          <ion-item
            v-for="s in intervention.alarme.firefighters.filter(
              (f) => f.group_name == g.name
            )"
            :key="s.id"
          >
            {{ s.fullname }}
          </ion-item>
          <ion-item
            v-for="s in intervention.alarme.unresolved.filter(
              (f) => f.group_name == g.name
            )"
            :key="s.fullname"
          >
            {{ s.fullname }}
          </ion-item>
        </ion-item-group>
      </ion-list>
    </div>
  </div>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
