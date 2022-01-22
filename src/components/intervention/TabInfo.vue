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
        <ion-item>
          <ion-label floating>Début</ion-label>
          <ion-datetime
            displayFormat="DD.MM.YYYY HH:mm"
            pickerFormat="DD MM YYYY HH mm"
            cancelText="Annuler"
            doneText="Valider"
            v-model="intervention.date_debut"
            :disabled="!intervention.en_creation"
          ></ion-datetime>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label floating>Fin</ion-label>
          <ion-datetime
            displayFormat="DD.MM.YYYY HH:mm"
            pickerFormat="DD MM YYYY HH mm"
            cancelText="Annuler"
            doneText="Valider"
            v-model="intervention.date_fin"
            :pickerOptions="customPickerOptions"
            :min="intervention.date_debut"
            @ionChange="setCorrectTimezone()"
            :disabled="!intervention.en_creation"
          ></ion-datetime>
        </ion-item>
      </ion-col>
    </ion-row>

    <ion-row>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label floating>Type</ion-label>
          <ion-select
            v-model="intervention.type_intervention_id"
            :disabled="!intervention.en_creation"
            okText
            cancelText="Annuler"
          >
            <ion-select-option
              v-for="type in typeInterventions"
              :key="type.id"
              :value="type.id"
            >{{ type.designation }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label floating>Objet</ion-label>
          <ion-input type="text" v-model="intervention.objet" :disabled="!intervention.en_creation"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating>Lieu du sinistre</ion-label>
          <ion-input type="text" v-model="intervention.lieu" :disabled="!intervention.en_creation"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating>NPA Localité</ion-label>
          <ion-input
            type="text"
            readonly="true"
            @ionFocus="selectLocalite"
            :value="getLocaliteFormattedValue(intervention.loc_id)"
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
          <ion-label floating>Statistiques fédérales</ion-label>
          <ion-select
            v-model="intervention.stat_federal_id"
            :disabled="!intervention.en_creation"
            okText
            cancelText="Annuler"
          >
            <ion-select-option
              v-for="stat in statsFederales"
              :key="stat.id"
              :value="stat.id"
            >{{ stat.nom }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label floating>Chef d'intervention</ion-label>
          <ion-input
            type="text"
            readonly="true"
            @ionFocus="selectChefIntervention()"
            :value="getSapeurFormattedValue(intervention.sapeur_id)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating>Nombre de personnes sauvées</ion-label>
          <ion-input
            type="number"
            :min="0"
            :value="intervention.nb_personnes_sauvees"
            @keypress="ensureNumericKey($event)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label floating>Nombre d'animaux sauvés</ion-label>
          <ion-input
            type="number"
            min="0"
            v-model="intervention.nb_animaux_sauves"
            @keypress="ensureNumericKey($event)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>

        <ion-item v-if="intervention.rapport_police">
          <ion-label floating>Nom et prénom de l'agent</ion-label>
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
          <ion-label floating>Nom</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.nom"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label floating>Adresse</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.adresse"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label floating>Téléphone</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.telephone"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
      </ion-col>
      <ion-col size-sm="6" size="12">
        <ion-item>
          <ion-label floating>Prénom</ion-label>
          <ion-input
            type="text"
            v-model="intervention.proprietaire.prenom"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label floating>NPA / Localité</ion-label>
          <ion-input
            type="text"
            readonly="true"
            @ionFocus="selectLocalite('proprietaire')"
            :value="getLocaliteFormattedValue(intervention.proprietaire.loc_id)"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label floating>E-mail</ion-label>
          <ion-input
            type="email"
            v-model="intervention.proprietaire.email"
            :disabled="!intervention.en_creation"
          ></ion-input>
        </ion-item>getLocaliteFormattedValue( intervention.proprietaire.loc_id )
        <h2>Responsables</h2>
        <ion-textarea v-model="intervention.responsables" :disabled="!intervention.en_creation"></ion-textarea>

        <h2>Description de l'intervention et commentaires</h2>
        <ion-textarea v-model="intervention.description" :disabled="!intervention.en_creation"></ion-textarea>

        <ion-button expand="full" @click="supprimerRapport()">Supprimer ce rapport</ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts" setup>
import useActiveIntervention from '@/store/useActiveIntervention';
import usePhaseTypes from '@/store/usePhaseTypes';
import useSapeurs from '@/store/useSapeurs';
import useStatsFederal from '@/store/useStatsFederal';
import useTypesIntervention from '@/store/useTypesIntervention';
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
} from '@ionic/vue';

const { state } = useActiveIntervention();
const intervention = state;

const moduleSapeur = useSapeurs();
const moduleType = useTypesIntervention();
const modulePhase = usePhaseTypes();
const moduleStatFederal = useStatsFederal();

const sapeurs = moduleSapeur.state.liste;
const typeInterventions = moduleType.state.liste;
const statsFederales = moduleStatFederal.state.liste;

const customPickerOptions = {
  buttons: [
    {
      text: 'Vide',
      handler: () => {
        intervention.date_fin = null as any;
      },
    },
  ],
};

const supprimerRapport = () => {
  // TODO:
};
const validate = () => {
  // TODO:
};
const selectLocalite = () => {
  // TODO:
};
const setCorrectTimezone = () => {
  // TODO:
};
const getLocaliteFormattedValue = () => {
  // TODO:
}; // Param = loc_id
const selectChefIntervention = () => {
  // TODO:
};

const getSapeurFormattedValue = (sapeurId: number) => {
  const sapeur = sapeurs.find(s => s.id == sapeurId);
  return sapeur?.nom + ' ' + sapeur?.prenom;
};

const ensureNumericKey = (event: KeyboardEvent) => {
  const pattern = /[0-9]/;
  if (!pattern.test(event.key)) {
    // invalid character, prevent input
    event.preventDefault();
  }
};

</script>
