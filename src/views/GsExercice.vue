<script lang="ts" setup>
import type { PresenceExercice } from "../models/presence-exercice.ts";
import type { HeureExerciceType } from "../models/heureexercicetype.ts";

import useExerciceCategories from "../store/useExerciceCategories.ts";

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
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonFooter,
  IonNote,
  IonSegment,
  IonSegmentButton,
  actionSheetController,
  alertController,
  modalController,
} from "@ionic/vue";
import {
  add,
  closeCircle,
  personAdd,
  refresh,
  checkmarkCircle,
  sync as syncIcon,
} from "ionicons/icons";
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

const indexedSapeurs = new Map<number, string>();
sapeurs.value.forEach((e) => {
  indexedSapeurs.set(e.id, e.nom + " " + e.prenom);
});

const indexedUnites = new Map<number, string>();
unites.value.forEach((e) => {
  indexedUnites.set(e.id, e?.abreviation);
});
const enhancedHeuresTypes = computed(() =>
  heuresTypes.value.map((e) => ({
    ...e,
    abreviation: indexedUnites.get(e.type_unite_id) ?? "",
  })),
);

const formatCategorie = (categorieId: number | undefined) => {
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
      const nomPrenom = indexedSapeurs.get(s.sapeur_id ?? 0);
      return { ...s, nomPrenom };
    })
    .sort((a, b) => (a.nomPrenom ?? "").localeCompare(b.nomPrenom ?? "")),
);

// En-tête : titre (désignation ou catégorie) et statut de saisie
const titre = computed(() =>
  exercice.value?.designation && exercice.value.designation != "-"
    ? exercice.value.designation
    : formatCategorie(exercice.value?.exercice_categorie_id) ?? "Exercice",
);

const statutLabel = computed(() => {
  switch (exercice.value?.localStatus) {
    case "in_progress":
      return "En cours d'édition";
    case "validated":
      return "Validé, en attente de synchronisation";
    default:
      return "A saisir";
  }
});

// Totaux affichés en chips au-dessus de la liste
const totaux = computed(() => {
  const liste = computedSapeurs.value ?? [];
  return [
    { label: "Total", value: liste.length, color: "medium" },
    {
      label: "Présents",
      value: liste.filter((s) => s.presenceStatut === 1).length,
      color: "success",
    },
    {
      label: "Absents",
      value: liste.filter((s) => s.presenceStatut === 2).length,
      color: "danger",
    },
    {
      label: "Remplacés",
      value: liste.filter((s) => s.presenceStatut === 3).length,
      color: "warning",
    },
    {
      label: "Excusés",
      value: liste.filter((s) => s.excuse_type_id !== null).length,
      color: "medium",
    },
  ];
});

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
    // Un sapeur ajouté manuellement (donc absent de la liste des convoqués)
    // l'est généralement parce qu'il est présent sans avoir été convoqué :
    // le marquer présent par défaut évite une étape de saisie superflue.
    convoque: false,
    present: true,
    amende: false,
    remplace: false,
    presenceStatut: 1,
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
  sapeur.presenceStatut = 1;
  // On conserve volontairement l'excuse (excuse_type_id) : un sapeur qui
  // s'était excusé mais qui vient finalement garde la trace de son excuse.
};

const selectAbsent = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.present = false;
  sapeur.absent = true;
  sapeur.remplace = false;
  sapeur.presenceStatut = 2;
};

const selectRemplace = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.absent = false;
  sapeur.present = false;
  sapeur.remplace = true;
  sapeur.presenceStatut = 3;
  // On conserve volontairement l'excuse (excuse_type_id) : cf. selectPresent.
};

const persistSapeur = (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  exercice.value.sapeurs = exercice.value.sapeurs.map((s) =>
    s.sapeur_id == sapeur.sapeur_id ? sapeur : s,
  );
  exercicesStore.updatExercice(exercice.value);
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
  // Refléter immédiatement l'état "Absent" sur le segment (statut 2), sinon
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
    buttons: [...buttons, { text: "Annuler", role: "cancel" }],
  });

  await actionSheet.present();
  await actionSheet.onDidDismiss();
  if (!sapeur.excuse_type_id) {
    sapeur.excuse = false;
  }

  // Persist the change (also flips localStatus to in_progress), like the
  // other handlers. Without this the edits stay on the displayed copy and
  // are lost on the next render/sync.
  persistSapeur(sapeur);
};

const resetting = ref(false);
const selectOption = async (
  value: string | number | undefined,
  sapeur: PresenceExercice,
) => {
  if (!exercice.value) return;
  if (resetting.value) {
    return;
  }
  const statut = Number(value);
  if (!statut || statut === sapeur.presenceStatut) return;
  const actions = [selectPresent, selectAbsent, selectRemplace];
  const action = actions[statut - 1];
  if (!action) return;
  await action(sapeur);

  // Save changes
  persistSapeur(sapeur);
};

const heureInput = (
  value: string | number | null | undefined,
  sapeur: PresenceExercice,
  heureType: HeureExerciceType,
) => {
  if (!exercice.value) return;
  if (resetting.value) {
    return;
  }
  const quantite = parseFloat(`${value ?? ""}`.replace(",", "."));
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
  persistSapeur(sapeur);
};

const getQuantite = (sapeur: PresenceExercice, heureTypeId: number) =>
  sapeur.heures.find((h) => h.heure_exercice_type_id == heureTypeId)?.quantite;

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

// Demande confirmation avant de perdre les saisies locales
const confirmReset = async () => {
  const confirm = await alertController.create({
    header: "Réinitialiser",
    message:
      "Toutes les saisies locales de cet exercice seront perdues. Continuer ?",
    buttons: [
      { text: "Annuler", role: "cancel" },
      { text: "Réinitialiser", role: "destructive", handler: () => reset() },
    ],
  });
  await confirm.present();
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
        <ion-title>{{ titre }}</ion-title>
      </ion-toolbar>
      <ion-toolbar class="sous-titre">
        <ion-note class="ion-padding-horizontal">
          {{ formatDate(exercice?.date || "", "dd.MM.yyyy") }}
          <template v-if="exercice?.lieu">
            – {{ exercice.lieu }}
          </template>
          · {{ statutLabel }}
        </ion-note>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="totaux">
        <ion-chip
          v-for="t in totaux"
          :key="t.label"
          :outline="true"
        >
          <ion-badge :color="t.color">
            {{ t.value }}
          </ion-badge>
          <ion-label>{{ t.label }}</ion-label>
        </ion-chip>
      </div>

      <ion-item
        v-if="!computedSapeurs?.length"
        lines="none"
      >
        Aucun sapeur convoqué
      </ion-item>

      <ion-card
        v-for="sapeur in computedSapeurs"
        :key="sapeur.sapeur_id ?? 0"
        class="carte-sapeur"
      >
        <ion-card-content>
          <div class="entete">
            <h2 class="nom">
              {{ sapeur.nomPrenom }}
            </h2>
            <ion-chip
              v-if="sapeur.excuse_type_id"
              color="medium"
              @click="removeExcuse(sapeur)"
            >
              <ion-label>{{ sapeur.excuse_type }}</ion-label>
              <ion-icon
                :icon="closeCircle"
                aria-label="Retirer l'excuse"
              />
            </ion-chip>
            <ion-chip
              v-else
              :outline="true"
              @click="addExcuse(sapeur)"
            >
              <ion-icon
                :icon="add"
                aria-hidden="true"
              />
              <ion-label>Excuse</ion-label>
            </ion-chip>
          </div>

          <ion-segment
            mode="ios"
            :value="sapeur.presenceStatut || undefined"
            @ion-change="selectOption($event.detail.value, sapeur)"
          >
            <ion-segment-button :value="1">
              <ion-label>Présent</ion-label>
            </ion-segment-button>
            <ion-segment-button :value="2">
              <ion-label>Absent</ion-label>
            </ion-segment-button>
            <ion-segment-button :value="3">
              <ion-label>Remplacé</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div
            v-if="enhancedHeuresTypes.length"
            class="heures"
          >
            <ion-input
              v-for="heure in enhancedHeuresTypes"
              :key="heure.id"
              type="number"
              inputmode="decimal"
              fill="outline"
              label-placement="stacked"
              :label="heure.designation"
              :value="getQuantite(sapeur, heure.id)"
              @ion-change="heureInput($event.detail.value, sapeur, heure)"
            >
              <ion-note slot="end">
                {{ heure.abreviation }}
              </ion-note>
            </ion-input>
          </div>

          <ion-note
            v-if="sapeur.convoque"
            class="convoque"
          >
            Convoqué
          </ion-note>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="actions">
          <ion-button
            fill="outline"
            size="small"
            @click="addSapeur"
          >
            <ion-icon
              slot="start"
              :icon="personAdd"
              aria-hidden="true"
            />
            Ajouter
          </ion-button>
          <ion-button
            fill="outline"
            size="small"
            :disabled="exercice?.localStatus == 'empty'"
            @click="confirmReset"
          >
            <ion-icon
              slot="start"
              :icon="refresh"
              aria-hidden="true"
            />
            Réinitialiser
          </ion-button>
          <ion-button
            v-if="exercice?.localStatus != 'validated'"
            size="small"
            :disabled="exercice?.localStatus == 'empty'"
            @click="validate"
          >
            <ion-icon
              slot="start"
              :icon="checkmarkCircle"
              aria-hidden="true"
            />
            Valider
          </ion-button>
          <ion-button
            v-else
            size="small"
            @click="sync"
          >
            <ion-icon
              slot="start"
              :icon="syncIcon"
              aria-hidden="true"
            />
            Synchroniser
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<style scoped>
.sous-titre {
  --min-height: 28px;
  font-size: 0.85rem;
}

.totaux {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.totaux ion-chip {
  margin: 0;
}

.totaux ion-badge {
  margin-right: 6px;
  min-width: 1.6em;
}

.carte-sapeur {
  margin: 0 0 10px 0;
}

.carte-sapeur ion-card-content {
  padding: 10px 12px 12px;
}

.entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.entete .nom {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.entete ion-chip {
  margin: 0;
  flex-shrink: 0;
}

.heures {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.heures ion-input {
  flex: 1;
  min-width: 0;
}

.convoque {
  display: block;
  margin-top: 6px;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}

.actions ion-button {
  flex: 1;
  margin: 0;
}
</style>
