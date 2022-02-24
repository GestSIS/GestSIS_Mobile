<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Informations générales</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button expand="block" @click="validate()" v-if="intervention.en_creation">
          <ion-icon slot="start" name="checkmark-circle"></ion-icon>Valider
        </ion-button>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size-sm="6" size="12">
        <ion-item @click="openModalDebut = !openModalDebut">
          <ion-label>Fin</ion-label>
          <ion-text
            slot="end"
            id="open-modal"
          >{{ intervention.date_debut ? formatDate(intervention.date_debut, 'dd.LL.yy HH:mm') : '' }}</ion-text>
          <ion-button fill="clear" slot="end">
            <ion-icon slot="end" name="calendar" />
          </ion-button>
          <ion-modal :is-open="openModalDebut">
            <ion-datetime
              presentation="time-date"
              :value="intervention.date_debut ? DateTime.fromSQL(intervention.date_debut).toISO() : ''"
              @ionChange="(ev: any) => intervention.date_debut = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
            />
          </ion-modal>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item @click="openModalFin = !openModalFin">
          <ion-label>Fin</ion-label>
          <ion-text
            slot="end"
            id="open-modal"
          >{{ intervention.date_fin ? formatDate(intervention.date_fin, 'dd.LL.yy HH:mm') : '' }}</ion-text>
          <ion-button fill="clear" slot="end">
            <ion-icon slot="end" name="calendar" />
          </ion-button>
          <ion-modal :is-open="openModalFin">
            <ion-datetime
              presentation="time-date"
              :min="DateTime.fromSQL(intervention.date_debut).toISO()"
              :value="DateTime.fromSQL(intervention.date_fin).toISO()"
              @ionChange="(ev: any) => intervention.date_fin = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
            />
          </ion-modal>
        </ion-item>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label position="floating">Type</ion-label>
          <ion-select
            interface="action-sheet"
            v-model="intervention.type_intervention_id"
            :disabled="!intervention.en_creation"
            okText="Ok"
            cancelText="Annuler"
          >
            <ion-select-option
              v-for="t in typeInterventions"
              :key="t.id"
              :value="t.id"
            >{{ t.designation }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Objet</ion-label>
          <ion-input type="text" v-model="intervention.objet" :disabled="!intervention.en_creation"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Lieu du sinistre</ion-label>
          <ion-input type="text" v-model="intervention.lieu" :disabled="!intervention.en_creation"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">NPA Localité</ion-label>
          <ion-input
            type="text"
            readonly
            @ionFocus="selectLocaliteIntervention"
            :value="getLocaliteFormattedValue(intervention.localite_id)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item class="checkbox-item">
          <ion-label>Rapport de police</ion-label>
          <ion-checkbox v-model="intervention.rapport_police" :disabled="!intervention.en_creation"></ion-checkbox>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label position="floating">Statistiques fédérales</ion-label>
          <ion-select
            interface="action-sheet"
            v-model="intervention.stat_federal_id"
            :disabled="!intervention.en_creation"
            okText="Ok"
            cancelText="Annuler"
          >
            <ion-select-option
              v-for="stat in statsFederales"
              :key="stat.id"
              :value="stat.id"
            >{{ stat.designation }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Chef d'intervention</ion-label>
          <ion-input
            type="text"
            readonly="true"
            @ionFocus="selectChefIntervention()"
            :value="getSapeurFormattedValue(intervention.sapeur_id)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Nombre de personnes sauvées</ion-label>
          <ion-input
            type="text"
            :min="0"
            :value="intervention.nb_personnes_sauvees"
            @keypress="ensureNumericKey($event)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Nombre d'animaux sauvés</ion-label>
          <ion-input
            type="text"
            :min="0"
            v-model="intervention.nb_animaux_sauves"
            @keypress="ensureNumericKey($event)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item v-if="intervention.rapport_police">
          <ion-label position="floating">Nom et prénom de l'agent</ion-label>
          <ion-input type="text" v-model="intervention.agent" :disabled="!intervention.en_creation"></ion-input>
        </ion-item>
      </ion-col>
    </ion-row>
  </ion-grid>

  <h2>Propriétaire</h2>
  <ion-grid>
    <ion-row>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label position="floating">Nom</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.nom"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Adresse</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.adresse"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Téléphone</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.telephone"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label position="floating">Prénom</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.prenom"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">NPA / Localité</ion-label>
          <ion-input
            type="text"
            readonly
            @ionFocus="selectLocaliteProprietaire()"
            :value="getLocaliteFormattedValue(intervention.proprietaire.localite_id)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">E-mail</ion-label>
          <ion-input
            type="text"
            inputmode="email"
            v-model="intervention.proprietaire.email"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col size="12">
        <h2>Responsables</h2>
        <ion-textarea
          lines="5"
          v-model="intervention.responsables"
          :disabled="!intervention.en_creation"
        ></ion-textarea>
      </ion-col>
      <ion-col size="12">
        <h2>Description de l'intervention et commentaires</h2>
        <ion-textarea
          lines="8"
          v-model="intervention.description"
          :disabled="!intervention.en_creation"
        ></ion-textarea>
        <ion-button expand="full" @click="supprimerRapport">Supprimer ce rapport</ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts" setup>
import useActiveIntervention from '@/store/useActiveIntervention';
import useInterventions from '@/store/useInterventions';
import useLocalites from '@/store/useLocalites';
import usePhaseTypes from '@/store/usePhaseTypes';
import useSapeurs from '@/store/useSapeurs';
import useStatsFederal from '@/store/useStatsFederal';
import useTypesIntervention from '@/store/useTypesIntervention';
import useDateFormatter from '@/tools/useDateFormatter';
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
  IonDatetime,
  IonIcon,
  modalController,
  IonModal,
  IonText,
  alertController
} from '@ionic/vue';
import { DateTime } from 'luxon';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ModalLocaliteSelectVue from '../modals/ModalLocaliteSelect.vue';
import ModalSapeurSelectVue from '../modals/ModalSapeurSelect.vue';

const router = useRouter();
const { formatDate } = useDateFormatter();
const { removeIntervention } = useInterventions();
const { state, persist } = useActiveIntervention();
const intervention = state;

const openModalDebut = ref(false);
const openModalFin = ref(false);

const moduleSapeur = useSapeurs();
const moduleType = useTypesIntervention();
const modulePhase = usePhaseTypes();
const moduleStatFederal = useStatsFederal();
const moduleLocalite = useLocalites();

const sapeurs = moduleSapeur.state;
const typeInterventions = moduleType.state;
const statsFederales = moduleStatFederal.state;
const localites = moduleLocalite.state;

watch(intervention, () => {
  persist();
}, { deep: true })

const customPickerOptions = {
  buttons: [
    {
      text: 'Vide',
      handler: () => {
        intervention.value.date_fin = null as any;
      },
    },
  ],
};

const supprimerRapport = async () => {
  console.log("Supprimer intervention");
  const confirm = await alertController.create({
    header: 'Supprimer l\'intervention',
    message: "Êtes-vous sûr de vouloir supprimer ce rapport d'intervention ? Cette action est irréversible et toutes les données seront perdues !",
    buttons: [
      {
        text: 'Non'
      },
      {
        text: 'Oui',
        handler: () => {
          router.back();
          removeIntervention(intervention.value.localUuid);
        }
      }
    ]
  });
  await confirm.present();
};
const validate = () => {
  // TODO:
};

const selectLocalite = async () => {
  const modalLocaliteSelect = await modalController
    .create({
      component: ModalLocaliteSelectVue,
      componentProps: {
        exceptSapeurIds: [],
      }
    })

  await modalLocaliteSelect.present();
  let { data } = await modalLocaliteSelect.onDidDismiss();

  return data;
}

const selectLocaliteIntervention = async () => {
  const localiteId = await selectLocalite();
  if (localiteId) {
    intervention.value.localite_id = localiteId;
  }
}

const selectLocaliteProprietaire = async () => {
  const localiteId = await selectLocalite();
  if (localiteId) {
    intervention.value.proprietaire.localite_id = localiteId;
  }
}

const selectChefIntervention = async () => {
  const modalSapeurSelect = await modalController
    .create({
      component: ModalSapeurSelectVue,
      componentProps: {
        exceptSapeurIds: [],
      }
    })

  await modalSapeurSelect.present();
  let { data } = await modalSapeurSelect.onDidDismiss();

  if (data) {
    intervention.value.sapeur_id = data;
  }
}

const getLocaliteFormattedValue = (localite_id: number) => {
  return localites.value.find(l => l.id == localite_id)?.designation;
};

const getSapeurFormattedValue = (sapeurId: number) => {
  const sapeur = sapeurs.value.find(s => s.id == sapeurId);
  return sapeur ? sapeur?.nom + ' ' + sapeur?.prenom : '';
};

const ensureNumericKey = (event: KeyboardEvent) => {
  const pattern = /[0-9]/;
  if (!pattern.test(event.key)) {
    // invalid character, prevent input
    event.preventDefault();
  }
};

</script>
