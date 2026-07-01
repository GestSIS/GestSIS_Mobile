<script lang="ts" setup>
import type { PresenceExercice } from "../models/presence-exercice.ts";
import type { HeureExerciceType } from "../models/heureexercicetype.ts";

import useExerciceCategories from "../store/useExerciceCategories.ts";

import { trashOutline } from "ionicons/icons";

import {
  IonButtons,
  IonBadge,
  IonInput,
  IonLabel,
  IonItem,
  IonContent,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonIcon,
  IonGrid,
  IonButton,
  IonRadioGroup,
  IonRadio,
  IonCol,
  IonRow,
  actionSheetController,
  modalController,
} from "@ionic/vue";
import { add, refresh, checkmarkCircle } from "ionicons/icons";
import { computed, nextTick, ref } from "vue";
import { useRoute } from "vue-router";

import useDateFormatter from "../tools/useDateFormatter.ts";
import useExexercices from "../store/useExercices.ts";
import router from "../router/index.ts";
import useExcuseTypes from "../store/useExcuseTypes.ts";
import useSapeurs from "../store/useSapeurs.ts";
import ModalSapeurSelectVue from "../components/modals/ModalSapeurSelect.vue";
import useHeureExerciceTypes from "../store/useHeureExerciceTypes.ts";
import useUnitesType from "../store/useUnitesTypes.ts";
import { useNotify } from "../tools/useToast.ts";

const { formatDate } = useDateFormatter();

const exercicesStore = useExexercices();
const categoriesStore = useExerciceCategories();
const excuseTypesStore = useExcuseTypes();
const sapeursStore = useSapeurs();
const heuresStore = useHeureExerciceTypes();
const unitesStore = useUnitesType();

const exercices = exercicesStore.state;
const categories = categoriesStore.state;
const excusesTypes = excuseTypesStore.state;
const sapeurs = sapeursStore.state;
const heuresTypes = heuresStore.state;
const unites = unitesStore.state;

const indexedSapeurs = new Map();
sapeurs.value.forEach((e) => {
  indexedSapeurs.set(e.id, e.nom + " " + e.prenom);
});

const indexedUnites = new Map();
unites.value.forEach((e) => {
  indexedUnites.set(e.id, e?.abreviation);
});
const enhancedHeuresTypes = computed(() =>
  heuresTypes.value.map((e) => ({
    ...e,
    abreviation: indexedUnites.get(e.type_unite_id),
  })),
);

const formatCategorie = (categorieId: number) => {
  return categories.value.find((c) => c.id == categorieId)?.designation;
};

const route = useRoute();
const exerciceUuid = route.params.uuid;

const exercice = ref(exercices.value.find((e) => e.localUuid == exerciceUuid));
if (!exercice.value) {
  router.back();
} else {
  // Compute data pour affichage
  exercice.value.sapeurs = exercice.value.sapeurs.map((p) => ({
    ...p,
    presenceStatut: p.present ? 1 : p.absent ? 2 : p.remplace ? 3 : 0,
    excuse_type: p.excuse_type_id
      ? excusesTypes.value.find((e) => e.id == p.excuse_type_id)?.designation ||
        ""
      : "",
  }));
  exercice.value.initialSapeurs = exercice.value?.initialSapeurs.map(
    (p) => ({
      ...p,
      presenceStatut: p.present ? 1 : p.absent ? 2 : p.remplace ? 3 : 0,
      excuse_type: p.excuse_type_id
        ? excusesTypes.value.find((e) => e.id == p.excuse_type_id)
            ?.designation || ""
        : "",
    }),
  );
}

const computedSapeurs = computed(() =>
  exercice.value?.sapeurs
    .map((s) => {
      const nomPrenom = indexedSapeurs.get(s.sapeur_id);
      return { ...s, nomPrenom };
    })
    .sort((a, b) => (a.nomPrenom ?? "").localeCompare(b.nomPrenom ?? "")),
);

const validate = () => {
  // Validate an exercice
  if (exercice.value) {
    exercice.value.localStatus = "validated";
    exercicesStore.updatExercice(exercice.value, true);
  }
};

const addSapeur = async () => {
  if (!exercice.value) return;
  const modalSapeurSelect = await modalController.create({
    component: ModalSapeurSelectVue,
    componentProps: {
      exceptSapeurIds: exercice.value.sapeurs.map((s) => s.sapeur_id),
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  const sapeurId = data;
  if (!sapeurId) {
    return;
  }

  exercice.value.sapeurs.push({
    id: null,
    sapeur_id: sapeurId,
    excuse_type_id: null,
    convoque: false,
    present: false,
    amende: false,
    remplace: false,
    presenceStatut: 0,
    excuse_type: "",
    absent: false,
    excuse: false,
    heures: [],
  });
  exercicesStore.updatExercice(exercice.value);
};

const selectPresent = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.absent = false;
  sapeur.present = true;
  sapeur.excuse = false;
  sapeur.remplace = false;
  // On conserve volontairement l'excuse (excuse_type_id) : un sapeur qui
  // s'était excusé mais qui vient finalement garde la trace de son excuse.
};

const selectAbsent = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.present = false;
  sapeur.absent = true;
  sapeur.remplace = false;
};

const selectRemplace = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.absent = false;
  sapeur.present = false;
  sapeur.remplace = true;
  // On conserve volontairement l'excuse (excuse_type_id) : cf. selectPresent.
};

const removeExcuse = async (sapeur: PresenceExercice) => {
  const sap = exercice.value?.sapeurs.find(
    (s) => s.sapeur_id === sapeur.sapeur_id,
  );
  if (sap === undefined || !exercice.value) return;
  sap.excuse_type = "";
  sap.excuse_type_id = null;
  exercicesStore.updatExercice(exercice.value);
};

const addExcuse = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.present = false;
  sapeur.absent = true;
  sapeur.remplace = false;
  // Refléter immédiatement l'état "Absent" sur la radio (statut 2), sinon
  // l'affichage diffère avant/après rechargement (recalculé depuis `absent`).
  sapeur.presenceStatut = 2;

  const buttons = excusesTypes.value.map((excuse) => ({
    text: excuse.designation,
    handler: () => {
      sapeur.excuse_type_id = excuse.id;
      sapeur.excuse_type = excuse.designation;
    },
  }));

  const actionSheet = await actionSheetController.create({
    header: "Excuses",
    buttons: buttons,
  });

  await actionSheet.present();
  await actionSheet.onDidDismiss();
  if (!sapeur.excuse_type_id) {
    sapeur.excuse = false;
  }

  // Persist the change (also flips localStatus to in_progress), like the
  // other handlers. Without this the edits stay on the displayed copy and
  // are lost on the next render/sync.
  exercice.value.sapeurs = exercice.value.sapeurs.map((s) =>
    s.sapeur_id == sapeur.sapeur_id ? sapeur : s,
  );
  exercicesStore.updatExercice(exercice.value);
};

const resetting = ref(false);
const selectOption = async (statut: number, sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  if (statut == null) {
    // Unselect
  }
  if (resetting.value) {
    return;
  }
  const actions = [selectPresent, selectAbsent, selectRemplace];
  const action = actions[statut - 1];
  if (!action) return;
  await action(sapeur);

  // Save changes
  exercice.value.sapeurs = exercice.value.sapeurs.map((s) =>
    s.sapeur_id == sapeur.sapeur_id ? sapeur : s,
  );
  exercicesStore.updatExercice(exercice.value);
};

const heureInput = (
  value: string | number,
  sapeur: PresenceExercice,
  heureType: HeureExerciceType,
) => {
  if (!exercice.value) return;
  if (resetting.value) {
    return;
  }
  const quantite = parseFloat(`${value}`);
  if (quantite) {
    const heure = sapeur.heures.find(
      (h) => h.heure_exercice_type_id == heureType.id,
    );
    sapeur.heures = [
      ...sapeur.heures.filter((h) => h.heure_exercice_type_id != heureType.id),
      // Conserver l'id existant : modifier une quantité = update côté API, pas
      // suppression + recréation. `id` reste null pour une nouvelle heure.
      {
        ...heure,
        quantite,
        heure_exercice_type_id: heureType.id,
        id: heure?.id ?? null,
      },
    ];
  } else {
    sapeur.heures = sapeur.heures.filter(
      (h) => h.heure_exercice_type_id != heureType.id,
    );
  }
  exercice.value.sapeurs = exercice.value.sapeurs.map((s) =>
    s.sapeur_id == sapeur.sapeur_id ? sapeur : s,
  );
  exercicesStore.updatExercice(exercice.value);
};

// Reset les saisies effectuées
const reset = () => {
  if (!exercice.value) return;
  resetting.value = true;
  exercice.value.sapeurs = [
    ...exercice.value.initialSapeurs.map((e) => ({ ...e })),
  ];
  exercice.value.localStatus = "empty";

  // Save changes
  exercicesStore.updatExercice(exercice.value, true);
  nextTick(() => {
    resetting.value = false;
  });
};

const sync = async () => {
  if (!exercice.value) return;
  const { success, error } = useNotify();
  try {
    await exercicesStore.sync();
    router.push({ name: "accueil" });
    success("Exercices synchronisés");
  } catch {
    error("Erreur lors des la synchronisation des exercices");
  }
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="{ name: 'exercices' }" />
        </ion-buttons>
        <ion-title>Exercices</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h3>
        {{
          exercice?.designation != "-"
            ? exercice?.designation
            : formatCategorie(exercice?.exercice_categorie_id)
        }}
        - {{ formatDate(exercice?.date || "", "dd.MM.yy") }}
      </h3>
      <ion-list>
        <ion-row class="sap-item list-header">
          <ion-col>Sapeur</ion-col>
          <ion-col class="col-radio"> Présent </ion-col>
          <ion-col class="col-radio"> Absent </ion-col>
          <ion-col class="col-radio"> Remplacé </ion-col>
          <ion-col class="col-radio"> Excuse </ion-col>
          <ion-col v-for="heure in heuresTypes" :key="heure.id">
            {{ heure.designation }}
          </ion-col>
        </ion-row>

        <div class="sapeurs">
          <ion-radio-group
            v-for="(sapeur, i) in computedSapeurs"
            :key="i"
            v-model="sapeur.presenceStatut"
            @ion-change="($event) => selectOption($event.target.value, sapeur)"
          >
            <ion-row class="sap-item" :class="i % 2 ? 'even-row' : 'odd-row'">
              <ion-col>
                {{ sapeur?.nomPrenom }}
                <br />
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="1" />
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="2" />
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="3" />
              </ion-col>
              <ion-col class="col-radio">
                <ion-badge v-if="sapeur.excuse_type">
                  {{ sapeur.excuse_type }}
                </ion-badge>
                <ion-button
                  v-if="sapeur.excuse_type_id"
                  size="small"
                  @click="removeExcuse(sapeur)"
                >
                  <ion-icon
                    :icon="trashOutline"
                    size=""
                    color="white"
                  ></ion-icon>
                </ion-button>
                <ion-badge v-else size="small" @click="addExcuse(sapeur)">
                  +
                </ion-badge>
              </ion-col>
              <ion-col v-for="heure in enhancedHeuresTypes" :key="heure.id">
                <ion-item lines="none">
                  <!-- {{ sapeur?.heures.length > 0 ? sapeur?.heures[0].heure_exercice_type_id : '' }} -->
                  <ion-input
                    type="number"
                    inputmode="decimal"
                    :value="
                      sapeur?.heures.find(
                        (h) => h.heure_exercice_type_id == heure.id,
                      )?.quantite
                    "
                    @ion-change.stop="
                      heureInput($event.target.value ?? '', sapeur, heure)
                    "
                  />
                  <ion-label slot="end">
                    {{ heure.abreviation }}
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-radio-group>
          <ion-row>
            <ion-col>Total : {{ computedSapeurs?.length }}</ion-col>
            <ion-col class="col-radio">
              {{
                computedSapeurs?.filter((s) => s.presenceStatut === 1)?.length
              }}
            </ion-col>
            <ion-col class="col-radio">
              {{
                computedSapeurs?.filter((s) => s.presenceStatut === 2)?.length
              }}
            </ion-col>
            <ion-col class="col-radio">
              {{
                computedSapeurs?.filter((s) => s.presenceStatut === 3)?.length
              }}
            </ion-col>
            <ion-col class="col-radio">
              {{
                computedSapeurs?.filter((s) => s.excuse_type_id !== null)
                  ?.length
              }}
            </ion-col>
          </ion-row>
        </div>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="addSapeur">
              <ion-icon slot="start" :icon="add" aria-hidden="true" />Ajouter
              une présence
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button
              expand="block"
              color="light"
              :disabled="exercice?.localStatus == 'empty'"
              @click="reset"
            >
              <ion-icon
                slot="start"
                :icon="refresh"
                aria-hidden="true"
              />Réinitialiser
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button
              v-if="exercice?.localStatus != 'validated'"
              expand="block"
              :disabled="exercice?.localStatus == 'empty'"
              @click="validate"
            >
              <ion-icon
                slot="start"
                :icon="checkmarkCircle"
                aria-hidden="true"
              />Valider
            </ion-button>
            <ion-button
              v-if="exercice?.localStatus == 'validated'"
              expand="block"
              @click="sync"
            >
              <ion-icon
                slot="start"
                :icon="checkmarkCircle"
                aria-hidden="true"
              />Synchroniser
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.sapeur {
  font-size: 1.6rem;
  padding-left: 16px;
  min-height: 4rem;
}

.sap-item {
  border-bottom: 1px solid #dedede;
  min-height: 3.2rem;
}

.col-radio {
  justify-content: center;
}

.sap-item ion-col {
  display: flex;
  align-items: center;
}

.row {
  align-items: center;
}

.details {
  color: #555;
}

.radio-md .radio-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-header {
  font-weight: bold;
  min-height: 2.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--ion-color-light-shade);
}
</style>
