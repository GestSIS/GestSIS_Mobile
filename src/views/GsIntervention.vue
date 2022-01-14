<script lang="ts" setup>
import moment from "moment";
import { reactive, ref, computed } from "vue";

import { PresenceExercice } from "@/models/bundle";
import { Exercice } from "@/models/bundle";
import { ExcuseType } from "@/models/bundle";
import { Intervention } from "@/models/bundle";
import { Sapeur } from "@/models/bundle";
import { Vehicule } from "@/models/bundle";
import { Materiel } from "@/models/bundle";

import {
  IonButtons,
  IonContent,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonIcon,
  IonGrid,
  IonButton,
  IonCol,
  IonRow,
  IonTextarea,
  IonDatetime,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonInput,
  IonCheckbox,
  actionSheetController,
} from "@ionic/vue";

// Data section
const onlyPendingMissions = ref(true);
// Switch to sapeurs une fois des groupes sélectionnées ?
const segmentPart = ref("RESUME");
const presencesSegmentPart = ref("GROUPES");

const intervention = reactive(new Intervention());
intervention.en_creation = true;
const evenements = reactive([]);
const groupes = reactive([]);
const vehicules = reactive([] as Vehicule[]);
const materiels = reactive([] as Materiel[]);
const sapeurs = reactive([] as Sapeur[]);
const typeInterventions = reactive([]);
const statsFederales = reactive([]);

const sapeursAvecPresenceExercicesIncompletes = computed(() =>
  intervention.sapeurs.filter(
    (sap) => sap.presences.filter((pres) => pres.date_fin == null).length > 0
  )
);
const sapeursSansPresenceExercices = computed(() => {
  const sapeursSaisi = intervention.missions.map((mission) => mission.sapeur);
  const sapeursIdPotentiel = new Set(intervention.sapeurs.map((sap) => sap.id));
  const sapeursExistant = new Set(sapeurs.map((sap) => sap.id));
  return sapeursSaisi.filter(
    (s) => !sapeursIdPotentiel.has(s.id) && sapeursExistant.has(s.id)
  );
});

const customPickerOptions = {
  buttons: [
    {
      text: "Vide",
      handler: () => {
        intervention.date_fin = null as any;
      },
    },
  ],
};

// Evenements part
const openEvent = () => {
  // TODO:
};
const addMission = () => {
  // TODO:
};
const editMission = () => {
  // TODO:
};
const addCall = () => {
  // TODO:
};
const editCall = () => {
  // TODO:
};
const changeVehiculeStatut = () => {
  // TODO:
};
const addMateriel = () => {
  // TODO:
};
const changeMaterielQuantity = () => {
  // TODO:
};
const removeMateriel = () => {
  // TODO:
};
const changeGroupeStatus = () => {
  // TODO:
};
const addPresenceExercice = () => {
  // TODO:
};
const editPresenceExercice = () => {
  // TODO:
};
const removePresenceExercice = () => {
  // TODO:
};
const setCorrectTimezone = () => {
  // TODO:
};
const selectLocalite = () => {
  // TODO:
};
const getLocaliteFormattedValue = () => {
  // TODO:
}; // Param = loc_id
const selectChefIntervention = () => {
  // TODO:
};
const getSapeurFormattedValue = () => {
  // TODO:
};
const supprimerRapport = () => {
  // TODO:
};

// Utils
const formatDate = (date: string, format: string) => {
  return moment(date).format(format || "DD:MM:yyyy");
  //  return moment(date).format("dd MMMM HH:mm");
};

const ensureNumericKey = (event: KeyboardEvent) => {
  const pattern = /[0-9]/;
  if (!pattern.test(event.key)) {
    // invalid character, prevent input
    event.preventDefault();
  }
};

//TODO: Test nb personnes sauvé ne peut pas être négatif
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            :defaultHref="{ name: 'interventions' }"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Exercices</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-segment v-model="segmentPart">
      <ion-segment-button value="RESUME">
        <ion-icon name="list"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="MISSIONS">
        <ion-icon name="body"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="APPELS">
        <ion-icon name="call"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="VEHICULES">
        <ion-icon name="car"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="MATERIEL">
        <ion-icon name="construct"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="PRESENCES">
        <ion-icon name="time"></ion-icon>
      </ion-segment-button>
      <ion-segment-button value="DIVERS">
        <ion-icon name="information-circle"></ion-icon>
      </ion-segment-button>
    </ion-segment>

    <ion-content padding>
      <div>
        <div v-if="segmentPart == 'RESUME'">
          <ion-list>
            <ion-item>
              <ion-label text-right
                >Afficher uniquement les missions en cours</ion-label
              >
              <ion-checkbox
                color="primary"
                item-end
                v-model="onlyPendingMissions"
              ></ion-checkbox>
            </ion-item>
          </ion-list>
          <section id="cd-timeline" class="cd-container">
            <div
              :class="['cd-timeline-block', event.color]"
              v-for="event of evenements"
              :key="event"
            >
              <div class="cd-timeline-icon positive">
                <ion-icon :name="event.icon"></ion-icon>
              </div>
              <div
                tappable
                class="cd-timeline-content positive"
                @click="openEvent(event)"
              >
                <h4 class="title">{{ event.titre }}</h4>
                <p class="date">
                  {{ formatDate(event.date) }}
                  <span *ngIf="event.auteur">par {{ event.auteur }}</span>
                </p>
                <p class="description" v-if="event.description">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div v-if="segmentPart == 'MISSIONS'">
          <ion-grid>
            <ion-row>
              <ion-col size="8">
                <h1>Missions</h1>
              </ion-col>
              <ion-row size="4">
                <ion-button
                  expand="block"
                  @click="addMission()"
                  :disabled="!intervention.en_creation"
                >
                  <ion-icon slot="start" name="add"></ion-icon>
                  Nouvelle mission
                </ion-button>
              </ion-row>
            </ion-row>
          </ion-grid>

          <ion-list>
            <button
              ion-item
              v-for="(mission, i) in intervention.missions"
              :key="i"
              @click="editMission(mission)"
              :disabled="!intervention.en_creation"
            >
              <ion-icon
                slot="start"
                :name="mission.date_fin ? 'checkmark' : 'time'"
              ></ion-icon>
              {{ mission.titre }} - {{ mission.sapeur.nom }}
              {{ mission.sapeur.prenom }}
              <p>
                {{ formatDate(mission.date_debut, "HH:mm 'le' dd.MM.yyyy") }}
              </p>
              <p>{{ mission.resume }}</p>
            </button>
          </ion-list>
        </div>

        <div v-if="segmentPart == 'APPELS'">
          <ion-grid>
            <ion-row>
              <ion-col size="8">
                <h1>Appels</h1>
              </ion-col>
              <ion-col size="4">
                <ion-button
                  expand="block"
                  @click="addCall()"
                  :disabled="!intervention.en_creation"
                >
                  <ion-icon name="add" slot="start"></ion-icon> Nouvel appel
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>

          <ion-list>
            <button
              ion-item
              v-for="(appel, i) in intervention.appels"
              :key="i"
              @click="editCall(appel)"
              :disabled="!intervention.en_creation"
            >
              {{ appel.nom }} - {{ appel.numero }}
              <p>
                Appelé à {{ formatDate(appel.date, "HH:mm 'le' dd.MM.yyyy") }}
              </p>
              <p>{{ appel.commentaire }}</p>
              <ion-button
                @click="removeCall(i, $event)"
                fill="clear"
                color="dark"
              >
                <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </button>
          </ion-list>
        </div>

        <div v-if="segmentPart == 'VEHICULES'">
          <ion-grid>
            <ion-row>
              <ion-col>
                <h1>Véhicules</h1>
              </ion-col>
            </ion-row>
          </ion-grid>

          <ion-list>
            <ion-item
              button
              v-for="(vehicule, i) in vehicules"
              :key="i"
              @click="changeVehiculeStatut(vehicule.id)"
              :disabled="!intervention.en_creation"
            >
              {{ vehicule.nom }}
              <ion-icon
                slot="end"
                :name="
                  intervention.vehicules.indexOf(vehicule.id) === -1
                    ? 'radio-button-off'
                    : 'checkmark-circle'
                "
              ></ion-icon>
            </ion-item>
          </ion-list>
        </div>

        <div v-if="segmentPart == 'MATERIEL'">
          <ion-grid>
            <ion-row>
              <ion-col size="8">
                <h1>Matériel</h1>
              </ion-col>
              <ion-col size="4">
                <ion-button
                  expand="block"
                  slot="start"
                  @click="addMateriel()"
                  :disabled="!intervention.en_creation"
                >
                  <ion-icon name="add" item-start></ion-icon> Ajouter
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>

          <ion-list>
            <ion-item
              v-for="(materiel, i) in intervention.materiel"
              :key="i"
              @click="changeMaterielQuantity(materiel, i)"
            >
              <strong item-start>{{ materiel.quantite }}</strong>
              {{ materiel.nom }}
              <button
                ion-button
                icon-only
                item-end
                @click="removeMateriel(i, $event)"
                clear
                color="dark"
              >
                <ion-icon name="close"></ion-icon>
              </button>
            </ion-item>
          </ion-list>
        </div>

        <div v-if="segmentPart == 'PRESENCES'">
          <div>
            <ion-segment v-model="presencesSegmentPart">
              <ion-segment-button value="GROUPES"> Groupes </ion-segment-button>
              <ion-segment-button value="SAPEURS"> Sapeurs </ion-segment-button>
            </ion-segment>
          </div>

          <div padding-top>
            <div v-if="presencesSegmentPart == 'GROUPES'">
              <ion-list>
                <ion-item
                  button
                  v-for="(groupe, i) of groupes"
                  :key="i"
                  @click="changeGroupeStatus(groupe.id)"
                  :disabled="!intervention.en_creation"
                >
                  <span>{{ groupe.prefix }}</span
                  >{{
                    (groupe.numero ? groupe.numero + " - " : "") +
                    groupe.designation
                  }}
                  <ion-icon
                    slot="end"
                    :name="
                      intervention.groupes.indexOf(groupe.id) === -1
                        ? 'radio-button-off'
                        : 'checkmark-circle'
                    "
                  ></ion-icon>
                </ion-item>
              </ion-list>
            </div>

            <div v-if="presencesSegmentPart == 'SAPEURS'">
              <ion-grid>
                <ion-row>
                  <ion-col size="4">
                    <h1>Présences</h1>
                  </ion-col>
                  <ion-col size="4">
                    <ion-button
                      ion-button
                      expand="block"
                      @click="addPresenceExercice('ARRIVEE')"
                      :disabled="!intervention.en_creation"
                    >
                      <ion-icon slot="start" name="log-in"></ion-icon> Arrivée
                    </ion-button>
                  </ion-col>
                  <ion-col size="4">
                    <ion-button
                      expand="block"
                      @click="addPresenceExercice('DEPART')"
                      :disabled="
                        !intervention.en_creation ||
                        sapeursAvecPresenceExercicesIncompletes.length === 0
                      "
                    >
                      <ion-icon slot="start" name="log-out"></ion-icon> Départ
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-grid>

              <!-- Sapeurs dont il manque la présence -->
              <ion-item-group
                v-for="(sapeur, i) of sapeursSansPresenceExercices"
                :key="i"
              >
                <ion-item-divider
                  color="light"
                  class="text-orange"
                  @click="addPresenceExercice('ARRIVEE', sapeur.id)"
                >
                  <ion-icon name="warning" item-start></ion-icon>
                  {{ sapeur.nom }} {{ sapeur.prenom }} - Présence manquante
                </ion-item-divider>
              </ion-item-group>

              <!-- Présences des sapeurs -->
              <ion-item-group
                v-for="(sapeur, i) in intervention.sapeurs"
                :key="i"
              >
                <ion-item-divider color="light"
                  >{{ sapeur.nom }} {{ sapeur.prenom }}</ion-item-divider
                >
                <ion-item
                  button
                  v-for="(presence, j) in sapeur.presences"
                  :key="j"
                  :disabled="!intervention.en_creation"
                  @click="editPresenceExercice(i, j)"
                >
                  {{ formatDate(presence.date_debut, "HH:mm") }} -
                  {{ formatDate(presence.date_fin, "HH:mm") }}
                  <ion-button
                    @click="removePresenceExercice(i, j, $event)"
                    fill="clear"
                    color="dark"
                  >
                    <ion-icon slot="icon-only" name="close"></ion-icon>
                  </ion-button>
                </ion-item>
              </ion-item-group>
            </div>
          </div>
        </div>

        <div v-if="segmentPart == 'DIVERS'">
          <ion-grid>
            <ion-row>
              <ion-col size="8">
                <h1>Informations générales</h1>
              </ion-col>
              <ion-col size="4">
                <ion-button
                  expand="block"
                  @click="validate()"
                  v-if="intervention.en_creation"
                >
                  <ion-icon slot="start" name="checkmark-circle"></ion-icon>
                  Valider
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
                    okText=""
                    cancelText="Annuler"
                  >
                    <ion-select-option
                      v-for="type in typeInterventions"
                      :key="type.id"
                      :value="type.id"
                      >{{ type.designation }}</ion-select-option
                    >
                  </ion-select>
                </ion-item>

                <ion-item>
                  <ion-label floating>Objet</ion-label>
                  <ion-input
                    type="text"
                    v-model="intervention.objet"
                    :disabled="!intervention.en_creation"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label floating>Lieu du sinistre</ion-label>
                  <ion-input
                    type="text"
                    v-model="intervention.lieu"
                    :disabled="!intervention.en_creation"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label floating>NPA Localité</ion-label>
                  <ion-input
                    type="text"
                    readonly="true"
                    @ionFocus="selectLocalite()"
                    :value="getLocaliteFormattedValue(intervention.loc_id)"
                    :disabled="!intervention.en_creation"
                  ></ion-input>
                </ion-item>

                <ion-item class="checkbox-item">
                  <ion-label>Rapport de police</ion-label>
                  <ion-checkbox
                    v-model="intervention.rapport_police"
                    :disabled="!intervention.en_creation"
                  ></ion-checkbox>
                </ion-item>
              </ion-col>
              <ion-col size-sm="6" size="12">
                <ion-item>
                  <ion-label floating>Statistiques fédérales</ion-label>
                  <ion-select
                    v-model="intervention.stat_federal_id"
                    :disabled="!intervention.en_creation"
                    okText=""
                    cancelText="Annuler"
                  >
                    <ion-select-option
                      v-for="stat in statsFederales"
                      :key="stat.id"
                      :value="stat.id"
                      >{{ stat.nom }}</ion-select-option
                    >
                  </ion-select>
                </ion-item>

                <ion-item>
                  <ion-label floating>Chef d'intervention</ion-label>
                  <ion-input
                    type="text"
                    readonly="true"
                    @ionFocus="selectChefIntervention()"
                    :value="
                      getSapeurFormattedValue(intervention.chef_inter_sap_id)
                    "
                    :disabled="!intervention.en_creation"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label floating>Nombre de personnes sauvées</ion-label>
                  <ion-input
                    type="number"
                    :min="0"
                    v-model="intervention.nb_personnes_sauvees"
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
                  <ion-input
                    type="text"
                    v-model="intervention.agent"
                    :disabled="!intervention.en_creation"
                  ></ion-input>
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
                    :value="
                      getLocaliteFormattedValue(
                        intervention.proprietaire.loc_id
                      )
                    "
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
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>

          <h2>Responsables</h2>
          <ion-textarea
            v-model="intervention.responsables"
            :disabled="!intervention.en_creation"
          ></ion-textarea>

          <h2>Description de l'intervention et commentaires</h2>
          <ion-textarea
            v-model="intervention.description"
            :disabled="!intervention.en_creation"
          ></ion-textarea>

          <ion-button expand="full" @click="supprimerRapport()">
            Supprimer ce rapport
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
</style>