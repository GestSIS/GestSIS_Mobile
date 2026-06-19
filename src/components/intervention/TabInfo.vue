<script lang="ts" setup>
import useActiveIntervention from "../../store/useActiveIntervention.ts";
import useInterventions from "../../store/useInterventions.ts";
import useLocalites from "../../store/useLocalites.ts";
// import usePhaseTypes from '../../store/usePhaseTypes';
import useSapeurs from "../../store/useSapeurs.ts";
import useStatsFederal from "../../store/useStatsFederal.ts";
import useTypesIntervention from "../../store/useTypesIntervention.ts";
import { useNotify } from "../../tools/useToast.ts";
import {
  IonButton,
  IonTextarea,
  IonCol,
  IonRow,
  IonGrid,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonIcon,
  alertController,
  modalController,
} from "@ionic/vue";
import {
  checkmarkCircle,
  createOutline,
  sync as syncIcon,
  navigate as navigateIcon,
} from "ionicons/icons";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import ModalLocaliteSelectVue from "../modals/ModalLocaliteSelect.vue";
import ModalSapeurSelectVue from "../modals/ModalSapeurSelect.vue";
import BaseDatetime from "../base/BaseDatetime.vue";
import useStore from "../../store/useStore.ts";
import { DateTime } from "luxon";
import ModalInterventionValidate from "../modals/ModalInterventionValidate.vue";

const router = useRouter();
const { syncModule } = useStore();
const interventionStore = useInterventions();
const { state, persist } = useActiveIntervention();
const intervention = state;
const errors: any = ref({});

const moduleSapeur = useSapeurs();
const moduleType = useTypesIntervention();
// const modulePhase = usePhaseTypes(); // TODO: Ajout gestion des phases
const moduleStatFederal = useStatsFederal();
const moduleLocalite = useLocalites();

const sapeurs = moduleSapeur.state;
const typeInterventions = moduleType.state;
const statsFederales = moduleStatFederal.state;
const localites = moduleLocalite.state;

watch(
  intervention,
  () => {
    persist();
  },
  { deep: true },
);

const supprimerRapport = async () => {
  const confirm = await alertController.create({
    header: "Supprimer l'intervention",
    message:
      "Êtes-vous sûr de vouloir supprimer ce rapport d'intervention ? Cette action est irréversible et toutes les données seront perdues !",
    buttons: [
      {
        text: "Non",
      },
      {
        text: "Oui",
        handler: () => {
          router.back();
          interventionStore.removeIntervention(intervention.value.localUuid);
        },
      },
    ],
  });
  await confirm.present();
};

const edit = async () => {
  intervention.value.localStatus = "in_progress";
};

const sync = async () => {
  // Sync les interventions
  await syncModule(interventionStore);
  router.push({ name: "accueil" });
  const { success } = useNotify();
  success("Intervention synchronisée");
};

const validate = async () => {
  errors.value = {};

  if (!intervention.value.date_debut) errors.value.date_debut = "A saisir";
  if (!intervention.value.localite_id) errors.value.localite_id = "A saisir";
  if (!intervention.value.degre) errors.value.degre = "A saisir";
  if (!intervention.value.objet) errors.value.objet = "A saisir";
  if (!intervention.value.lieu) errors.value.lieu = "A saisir";
  if (!intervention.value.sapeur_id) errors.value.sapeur_id = "A saisir";
  if (!intervention.value.stat_federal_id)
    errors.value.stat_federal_id = "A saisir";
  if (
    intervention.value.stat_nb < 0 ||
    (intervention.value.stat_nb != 0 && !intervention.value.stat_nb)
  )
    errors.value.stat_nb = "A saisir";
  if (!intervention.value.type_intervention_id)
    errors.value.type_intervention_id = "A saisir";

  const notify = useNotify();
  if (Object.keys(errors.value).length > 0) {
    if (!intervention.value.date_fin) errors.value.date_fin = "A saisir";
    notify.error("Veuillez compléter tous les champs !");
    return;
  }

  // Check toutes les missions sont terminées
  if (!intervention.value.missions.every((m) => m.date_fin)) {
    notify.error(
      "Certaines missions sont toujours en cours ! Veillez à toutes les quittancer afin de pouvoir valider cette intervention.",
    );
    return;
  }

  // Check toutes les présences sont complètes
  if (
    !intervention.value.sapeurs.every((s) =>
      s.presences.every((p) => p.date_fin),
    )
  ) {
    notify.error(
      "Certaines présences sont incomplètes ! Veillez à compléter toutes les présences afin de pouvoir valider cette intervention.",
    );
    return;
  }

  // Check tous les sapeurs saisis dans les missions sont bien présent
  const sapeursSaisi = [
    ...new Set(
      (intervention.value.missions ?? [])
        ?.map((mission) => mission.sapeur)
        ?.map((s) => s.id)
        ?.filter((id) => id !== null),
    ),
  ];
  const sapeursIdPotentiel = new Set<number>(
    intervention.value.sapeurs.map((sap) => sap.id),
  );
  const sapeursExistant = new Set<number>(sapeurs.value.map((sap) => sap.id));
  const sapeursSansPresenceExercices = sapeursSaisi.filter(
    (s) => s && !sapeursIdPotentiel.has(s) && sapeursExistant.has(s),
  );
  if (sapeursSansPresenceExercices.length > 0) {
    notify.error(
      "Sapeurs manquants ! Saisissez les sapeurs manquant ayant effectués des missions afin de pouvoir valider cette intervention.",
    );
    return;
  }

  const modalValider = await modalController.create({
    component: ModalInterventionValidate,
    componentProps: {
      date: intervention.value.date_fin,
    },
  });

  await modalValider.present();
  const { data } = await modalValider.onDidDismiss();

  if (data) {
    intervention.value.date_fin = data.slice(0, 16);
    intervention.value.localStatus = "validated";

    router.push({ name: "accueil" });
  }
};

const selectLocalite = async () => {
  const modalLocaliteSelect = await modalController.create({
    component: ModalLocaliteSelectVue,
    componentProps: {
      exceptSapeurIds: [],
    },
  });

  await modalLocaliteSelect.present();
  const { data } = await modalLocaliteSelect.onDidDismiss();

  return data;
};

const selectLocaliteIntervention = async () => {
  const localiteId = await selectLocalite();
  if (localiteId) {
    intervention.value.localite_id = localiteId;
  }
};

const selectLocaliteProprietaire = async () => {
  const localiteId = await selectLocalite();
  if (localiteId) {
    intervention.value.proprietaire.localite_id = localiteId;
  }
};

const selectChefIntervention = async () => {
  const modalSapeurSelect = await modalController.create({
    component: ModalSapeurSelectVue,
    componentProps: {
      exceptSapeurIds: [],
      preSelectionSapeurIds: state.value.sapeurs.map((s) => s.id),
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  if (data) {
    intervention.value.sapeur_id = data;
  }
};

const getLocaliteFormattedValue = (localite_id: number | null) => {
  return localites.value.find((l) => l.id === localite_id)?.designation;
};

const getSapeurFormattedValue = (sapeurId: number | null) => {
  const sapeur = sapeurs.value.find((s) => s.id == sapeurId);
  return sapeur ? sapeur?.nom + " " + sapeur?.prenom : "";
};

const ensureNumericKey = (event: KeyboardEvent) => {
  const pattern = /[0-9]/;
  if (!pattern.test(event.key)) {
    // invalid character, prevent input
    event.preventDefault();
  }
};

const roundDateToQuarter = (date: string) => {
  let datetime = DateTime.fromSQL(date);
  datetime = datetime.set({
    minute: datetime.minute - (datetime.minute % 15),
    second: 0,
    millisecond: 0,
  });
  return datetime?.toSQL()?.slice(0, 16) || "";
};

const startDate = ref<string>(
  roundDateToQuarter(intervention.value.date_debut ?? ""),
);
const dateDebutChanged = (date: string) => {
  // Change date de début pour sapeurs saisies
  const roundedDate = roundDateToQuarter(date);
  intervention.value.sapeurs = intervention.value.sapeurs.map((s: any) => ({
    ...s,
    presences: s.presences.map((p: any) => ({
      ...p,
      date_debut:
        p.date_debut.slice(0, 16) === startDate.value
          ? roundedDate
          : p.date_debut,
    })),
  }));

  startDate.value = roundedDate;
};

const navigate = () => {
  if (
    !intervention.value.wgs84 ||
    intervention.value.wgs84.split(",").length !== 2
  ) {
    window.open("https://www.google.ch/maps");
  } else {
    window.open(
      "https://www.google.ch/maps/place/" +
        intervention.value.wgs84.split(",").reverse().join(","),
    );
  }
};
</script>

<template>
  <ion-grid>
    <ion-row>
      <ion-col :size="intervention.localStatus == 'validated' ? '4' : '8'">
        <h2>Informations générales</h2>
      </ion-col>
      <ion-col v-if="intervention.localStatus == 'validated'" size="4">
        <ion-button expand="block" @click="edit()">
          <ion-icon
            slot="start"
            :icon="createOutline"
            aria-hidden="true"
          />Modifier
        </ion-button>
      </ion-col>
      <ion-col v-if="intervention.localStatus == 'validated'" size="4">
        <ion-button expand="block" @click="sync()">
          <ion-icon
            slot="start"
            :icon="syncIcon"
            aria-hidden="true"
          />Synchroniser
        </ion-button>
      </ion-col>
      <ion-col v-if="intervention.localStatus != 'validated'" size="4">
        <ion-button expand="block" @click="validate()">
          <ion-icon
            slot="start"
            :icon="checkmarkCircle"
            aria-hidden="true"
          />Valider
        </ion-button>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size-sm="6" size="12">
        <base-datetime
          v-model="intervention.date_debut"
          :invalid="!!errors.date_debut"
          :disabled="intervention.localStatus == 'validated'"
          :max="intervention.date_fin"
          @update:model-value="dateDebutChanged"
        >
          Début
        </base-datetime>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <base-datetime
          v-model="intervention.date_fin"
          :invalid="!!errors.date_fin"
          :disabled="intervention.localStatus == 'validated'"
          :min="intervention.date_debut"
          :clearable="true"
        >
          Fin
        </base-datetime>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size="12" size-sm="6">
        <ion-item>
          <ion-input
            v-model="intervention.objet"
            type="text"
            label-placement="floating"
            label="Objet"
            :class="{ invalid: !!errors?.objet }"
            :disabled="intervention.localStatus == 'validated'"
            @change="dateDebutChanged"
          />
        </ion-item>

        <ion-item>
          <ion-input
            type="text"
            label-placement="floating"
            label="NPA Localité"
            :class="{ invalid: !!errors?.localite_id }"
            readonly
            :value="getLocaliteFormattedValue(intervention.localite_id)"
            :disabled="intervention.localStatus == 'validated'"
            @click="selectLocaliteIntervention"
          />
        </ion-item>

        <ion-item class="checkbox-item">
          <ion-checkbox
            v-model="intervention.rapport_police"
            :disabled="intervention.localStatus == 'validated'"
          >
            Rapport de police
          </ion-checkbox>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-input
            type="text"
            label-placement="floating"
            label="Chef d'intervention"
            :class="{ invalid: !!errors?.sapeur_id }"
            :readonly="true"
            :value="getSapeurFormattedValue(intervention.sapeur_id)"
            :disabled="intervention.localStatus == 'validated'"
            @click="selectChefIntervention()"
          />
        </ion-item>

        <ion-item>
          <ion-input
            v-model="intervention.lieu"
            type="text"
            label-placement="floating"
            label="Lieu du sinistre"
            :class="{ invalid: !!errors?.lieu }"
            :disabled="intervention.localStatus == 'validated'"
          />
        </ion-item>

        <ion-item v-if="intervention.rapport_police">
          <ion-input
            v-model="intervention.agent"
            type="text"
            label-placement="floating"
            label="Nom et prénom de l'agent"
            :disabled="intervention.localStatus == 'validated'"
          />
        </ion-item>
        <ion-item v-if="intervention.wgs84">
          <ion-button @click="navigate">
            <ion-icon slot="start" :icon="navigateIcon" aria-hidden="true" />
            Google maps
          </ion-button>
        </ion-item>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-grid>
    <ion-row>
      <ion-col size="12">
        <h2>Statistiques</h2>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-select
            v-model="intervention.type_intervention_id"
            label-placement="floating"
            label="Type"
            :class="{ invalid: !!errors?.type_intervention_id }"
            interface="action-sheet"
            ok-text="Ok"
            cancel-text="Annuler"
            :disabled="intervention.localStatus == 'validated'"
          >
            <ion-select-option
              v-for="t in typeInterventions"
              :key="t.id"
              :value="t.id"
            >
              {{ t.designation }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select
            v-model="intervention.degre"
            label-placement="floating"
            label="Degré"
            :class="{ invalid: !!errors?.degre }"
            interface="action-sheet"
            ok-text="Ok"
            cancel-text="Annuler"
            :disabled="intervention.localStatus == 'validated'"
          >
            <ion-select-option
              v-for="stat in [
                { id: 1, type: 'Fausse-alarme' },
                { id: 2, type: 'Petite' },
                { id: 3, type: 'Moyenne' },
                { id: 4, type: 'Grande' },
              ]"
              :key="stat.id"
              :value="stat.id"
            >
              {{ stat.type }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select
            v-model="intervention.stat_federal_id"
            label-placement="floating"
            label="Statistiques fédérales"
            :class="{ invalid: !!errors?.stat_federal_id }"
            interface="action-sheet"
            ok-text="Ok"
            cancel-text="Annuler"
            :disabled="intervention.localStatus == 'validated'"
          >
            <ion-select-option
              v-for="stat in statsFederales"
              :key="stat.id"
              :value="stat.id"
            >
              {{ stat.designation }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-input
            type="number"
            label-placement="floating"
            label="Nombre d'interventions"
            :class="{ invalid: !!errors?.stat_nb }"
            inputmode="numeric"
            :min="0"
            :value="intervention.stat_nb"
            :disabled="intervention.localStatus == 'validated'"
            @ion-change="
              (ev: any) => (intervention.stat_nb = parseInt(ev.target.value))
            "
            @keypress="ensureNumericKey($event)"
          />
        </ion-item>
        <ion-item>
          <ion-input
            label-placement="floating"
            label="Nombre de personnes sauvées"
            type="number"
            inputmode="numeric"
            :min="0"
            :value="intervention.sauve_personne"
            :disabled="intervention.localStatus == 'validated'"
            @ion-change="
              (ev: any) =>
                (intervention.sauve_personne = parseInt(ev.target.value))
            "
            @keypress="ensureNumericKey($event)"
          />
        </ion-item>
        <ion-item>
          <ion-input
            type="number"
            label-placement="floating"
            label="Nombre d'animaux sauvés"
            inputmode="numeric"
            :min="0"
            :value="intervention.sauve_animaux"
            :disabled="intervention.localStatus == 'validated'"
            @ion-change="
              (ev: any) =>
                (intervention.sauve_animaux = parseInt(ev.target.value))
            "
            @keypress="ensureNumericKey($event)"
          />
        </ion-item>
      </ion-col>
    </ion-row>
  </ion-grid>

  <form>
    <ion-grid>
      <ion-row>
        <ion-col size="12">
          <h2>Propriétaire</h2>
        </ion-col>
        <ion-col size-sm="6" size="12">
          <ion-item>
            <ion-input
              v-model="intervention.proprietaire.nom"
              label-placement="floating"
              label="Nom"
              type="text"
              :disabled="intervention.localStatus == 'validated'"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="intervention.proprietaire.adresse"
              label-placement="floating"
              label="Adresse"
              type="text"
              :disabled="intervention.localStatus == 'validated'"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="intervention.proprietaire.telephone"
              label-placement="floating"
              label="Téléphone"
              type="text"
              :disabled="intervention.localStatus == 'validated'"
            />
          </ion-item>
        </ion-col>
        <ion-col size-sm="6" size="12">
          <ion-item>
            <ion-input
              v-model="intervention.proprietaire.prenom"
              label-placement="floating"
              label="Prénom"
              type="text"
              :disabled="intervention.localStatus == 'validated'"
            />
          </ion-item>
          <ion-item>
            <ion-input
              label-placement="floating"
              label="NPA / Localité"
              type="text"
              readonly
              :value="
                getLocaliteFormattedValue(intervention.proprietaire.localite_id)
              "
              :disabled="intervention.localStatus == 'validated'"
              @click="selectLocaliteProprietaire()"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="intervention.proprietaire.email"
              label-placement="floating"
              label="E-mail"
              type="text"
              inputmode="email"
              :disabled="intervention.localStatus == 'validated'"
            />
          </ion-item>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="12">
          <h2>Responsable</h2>
          <ion-textarea
            v-model="intervention.responsable"
            aria-label="Responsable"
            :rows="5"
            :disabled="intervention.localStatus == 'validated'"
          />
        </ion-col>
        <ion-col size="12">
          <h2>Description de l'intervention et commentaires</h2>
          <ion-textarea
            v-model="intervention.description"
            aria-label="Description de l'intervention et commentaires"
            :rows="8"
            :disabled="intervention.localStatus == 'validated'"
          />
          <ion-button expand="full" @click="supprimerRapport">
            Supprimer ce rapport
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </form>
</template>

<style scoped>
.invalid {
  --color: var(--ion-color-primary);
}
</style>
