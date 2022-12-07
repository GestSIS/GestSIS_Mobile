<script lang="ts" setup>
import useActiveIntervention from "@/store/useActiveIntervention";
import useInterventions from "@/store/useInterventions";
import useLocalites from "@/store/useLocalites";
// import usePhaseTypes from '@/store/usePhaseTypes';
import useSapeurs from "@/store/useSapeurs";
import useStatsFederal from "@/store/useStatsFederal";
import useTypesIntervention from "@/store/useTypesIntervention";
import { useNotify } from "@/tools/useToast";
import {
  IonButton,
  IonTextarea,
  IonCol,
  IonRow,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonIcon,
  alertController,
  modalController,
} from "@ionic/vue";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import ModalLocaliteSelectVue from "../modals/ModalLocaliteSelect.vue";
import ModalSapeurSelectVue from "../modals/ModalSapeurSelect.vue";
import BaseDatetime from "../base/BaseDatetime.vue";
import useStore from "@/store/useStore";
import { DateTime } from "luxon";

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
  { deep: true }
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
  if (!intervention.value.date_fin) errors.value.date_fin = "A saisir";
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
    notify.error("Veuillez compléter tous les champs !");
    return;
  }

  // Check toutes les missions sont terminées
  if (!intervention.value.missions.every((m) => m.date_fin)) {
    notify.error(
      "Certaines missions sont toujours en cours ! Veillez à toutes les quittancer afin de pouvoir valider cette intervention."
    );
    return;
  }

  // Check toutes les présences sont complètes
  if (
    !intervention.value.sapeurs.every((s) =>
      s.presences.every((p) => p.date_fin)
    )
  ) {
    notify.error(
      "Certaines présences sont incomplètes ! Veillez à compléter toutes les présences afin de pouvoir valider cette intervention."
    );
    return;
  }

  // Check tous les sapeurs saisis dans les missions sont bien présent
  const sapeursSaisi = [
    ...new Set(
      intervention.value.missions
        .map((mission) => mission.sapeur)
        .map((s) => s.id)
    ),
  ];
  const sapeursIdPotentiel = new Set(
    intervention.value.sapeurs.map((sap) => sap.id)
  );
  const sapeursExistant = new Set(sapeurs.value.map((sap) => sap.id));
  const sapeursSansPresenceExercices = sapeursSaisi.filter(
    (s) => !sapeursIdPotentiel.has(s) && sapeursExistant.has(s)
  );
  if (sapeursSansPresenceExercices.length > 0) {
    notify.error(
      "Sapeurs manquants ! Saisissez les sapeurs manquant ayant effectués des missions afin de pouvoir valider cette intervention."
    );
    return;
  }

  const confirm = await alertController.create({
    header: "Valider l'intervention",
    message:
      "Êtes-vous sûr de vouloir valider ce rapport d'intervention ? Les rapports d'interventions seront supprimés de la tablette une fois synchronisés.",
    buttons: [
      {
        text: "Non",
      },
      {
        text: "Oui",
        handler: () => {
          intervention.value.localStatus = "validated";
          // TODO: Change to go back to
          router.push({ name: "accueil" });
        },
      },
    ],
  });
  await confirm.present();
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
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  if (data) {
    intervention.value.sapeur_id = data;
  }
};

const getLocaliteFormattedValue = (localite_id: number) => {
  return localites.value.find((l) => l.id == localite_id)?.designation;
};

const getSapeurFormattedValue = (sapeurId: number) => {
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
  return datetime.toSQL().slice(0, 16);
};

const startDate = ref<string>(
  roundDateToQuarter(intervention.value.date_debut)
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
</script>

<template>
  <ion-grid>
    <ion-row>
      <ion-col :size="intervention.localStatus == 'validated' ? '4' : '8'">
        <h2>Informations générales</h2>
      </ion-col>
      <ion-col size="4" v-if="intervention.localStatus == 'validated'">
        <ion-button expand="block" @click="edit()">
          <ion-icon slot="start" name="create-outline"></ion-icon>Modifier
        </ion-button>
      </ion-col>
      <ion-col size="4" v-if="intervention.localStatus == 'validated'">
        <ion-button expand="block" @click="sync()">
          <ion-icon slot="start" name="sync"></ion-icon>Synchroniser
        </ion-button>
      </ion-col>
      <ion-col size="4" v-if="intervention.localStatus != 'validated'">
        <ion-button expand="block" @click="validate()">
          <ion-icon slot="start" name="checkmark-circle"></ion-icon>Valider
        </ion-button>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size-sm="6" size="12">
        <base-datetime
          :invalid="errors.date_debut"
          :disabled="intervention.localStatus == 'validated'"
          :max="intervention.date_fin"
          v-model="intervention.date_debut"
          @update:modelValue="dateDebutChanged"
          >Début
        </base-datetime>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <base-datetime
          :invalid="!!errors.date_fin"
          :disabled="intervention.localStatus == 'validated'"
          :min="intervention.date_debut"
          v-model="intervention.date_fin"
          :clearable="true"
        >
          Fin
        </base-datetime>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size="12" size-sm="6">
        <ion-item>
          <ion-label :color="errors.objet ? 'primary' : ''" position="floating"
            >Objet</ion-label
          >
          <ion-input
            type="text"
            v-model="intervention.objet"
            :disabled="intervention.localStatus == 'validated'"
            @change="dateDebutChanged"
          >
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-label
            :color="errors.localite_id ? 'primary' : ''"
            position="floating"
            >NPA Localité</ion-label
          >
          <ion-input
            type="text"
            readonly
            @ionFocus="selectLocaliteIntervention"
            :value="getLocaliteFormattedValue(intervention.localite_id)"
            :disabled="intervention.localStatus == 'validated'"
          ></ion-input>
        </ion-item>

        <ion-item class="checkbox-item">
          <ion-label>Rapport de police</ion-label>
          <ion-checkbox
            v-model="intervention.rapport_police"
            :disabled="intervention.localStatus == 'validated'"
          >
          </ion-checkbox>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label
            :color="errors.sapeur_id ? 'primary' : ''"
            position="floating"
            >Chef d'intervention</ion-label
          >
          <ion-input
            type="text"
            :readonly="true"
            @ionFocus="selectChefIntervention()"
            :value="getSapeurFormattedValue(intervention.sapeur_id)"
            :disabled="intervention.localStatus == 'validated'"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label :color="errors.lieu ? 'primary' : ''" position="floating"
            >Lieu du sinistre</ion-label
          >
          <ion-input
            type="text"
            v-model="intervention.lieu"
            :disabled="intervention.localStatus == 'validated'"
          >
          </ion-input>
        </ion-item>

        <ion-item v-if="intervention.rapport_police">
          <ion-label position="floating">Nom et prénom de l'agent</ion-label>
          <ion-input
            type="text"
            v-model="intervention.agent"
            :disabled="intervention.localStatus == 'validated'"
          >
          </ion-input>
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
          <ion-label
            :color="errors.type_intervention_id ? 'primary' : ''"
            position="floating"
            >Type</ion-label
          >
          <ion-select
            interface="action-sheet"
            v-model="intervention.type_intervention_id"
            okText="Ok"
            cancelText="Annuler"
            :disabled="intervention.localStatus == 'validated'"
          >
            <ion-select-option
              v-for="t in typeInterventions"
              :key="t.id"
              :value="t.id"
              >{{ t.designation }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label :color="errors.degre ? 'primary' : ''" position="floating"
            >Degré</ion-label
          >
          <ion-select
            interface="action-sheet"
            v-model="intervention.degre"
            okText="Ok"
            cancelText="Annuler"
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
              >{{ stat.type }}</ion-select-option
            >
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label
            :color="errors.stat_federal_id ? 'primary' : ''"
            position="floating"
            >Statistiques fédérales
          </ion-label>
          <ion-select
            interface="action-sheet"
            v-model="intervention.stat_federal_id"
            okText="Ok"
            cancelText="Annuler"
            :disabled="intervention.localStatus == 'validated'"
          >
            <ion-select-option
              v-for="stat in statsFederales"
              :key="stat.id"
              :value="stat.id"
              >{{ stat.designation }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label
            :color="errors.stat_nb ? 'primary' : ''"
            position="floating"
            >Nombre d'interventions</ion-label
          >
          <ion-input
            type="number"
            inputmode="numeric"
            :min="0"
            @ionChange="(ev: any) => intervention.stat_nb = parseInt(ev.target.value)"
            :value="intervention.stat_nb"
            @keypress="ensureNumericKey($event)"
            :disabled="intervention.localStatus == 'validated'"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Nombre de personnes sauvées</ion-label>
          <ion-input
            type="number"
            inputmode="numeric"
            :min="0"
            @ionChange="(ev: any) => intervention.sauve_personne = parseInt(ev.target.value)"
            :value="intervention.sauve_personne"
            @keypress="ensureNumericKey($event)"
            :disabled="intervention.localStatus == 'validated'"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Nombre d'animaux sauvés</ion-label>
          <ion-input
            type="number"
            inputmode="numeric"
            :min="0"
            @ionChange="(ev: any) => intervention.sauve_animaux = parseInt(ev.target.value)"
            :value="intervention.sauve_animaux"
            @keypress="ensureNumericKey($event)"
            :disabled="intervention.localStatus == 'validated'"
          ></ion-input>
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
            <ion-label position="floating">Nom</ion-label>
            <ion-input
              type="text"
              v-model="intervention.proprietaire.nom"
              :disabled="intervention.localStatus == 'validated'"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Adresse</ion-label>
            <ion-input
              type="text"
              v-model="intervention.proprietaire.adresse"
              :disabled="intervention.localStatus == 'validated'"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Téléphone</ion-label>
            <ion-input
              type="text"
              v-model="intervention.proprietaire.telephone"
              :disabled="intervention.localStatus == 'validated'"
            ></ion-input>
          </ion-item>
        </ion-col>
        <ion-col size-sm="6" size="12">
          <ion-item>
            <ion-label position="floating">Prénom</ion-label>
            <ion-input
              type="text"
              v-model="intervention.proprietaire.prenom"
              :disabled="intervention.localStatus == 'validated'"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">NPA / Localité</ion-label>
            <ion-input
              type="text"
              readonly
              @ionFocus="selectLocaliteProprietaire()"
              :value="
                getLocaliteFormattedValue(intervention.proprietaire.localite_id)
              "
              :disabled="intervention.localStatus == 'validated'"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">E-mail</ion-label>
            <ion-input
              type="text"
              inputmode="email"
              v-model="intervention.proprietaire.email"
              :disabled="intervention.localStatus == 'validated'"
            ></ion-input>
          </ion-item>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="12">
          <h2>Responsables</h2>
          <ion-textarea
            :rows="5"
            v-model="intervention.responsables"
            :disabled="intervention.localStatus == 'validated'"
          ></ion-textarea>
        </ion-col>
        <ion-col size="12">
          <h2>Description de l'intervention et commentaires</h2>
          <ion-textarea
            :rows="8"
            v-model="intervention.description"
            :disabled="intervention.localStatus == 'validated'"
          >
          </ion-textarea>
          <ion-button expand="full" @click="supprimerRapport"
            >Supprimer ce rapport</ion-button
          >
        </ion-col>
      </ion-row>
    </ion-grid>
  </form>
</template>
