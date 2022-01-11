<script lang="ts" setup>
import moment from "moment";
import { Presence } from "@/models/presence";
import { Exercice } from "@/models/exercice";
import { ExcuseType } from "@/models/excusetype";
import { reactive } from "vue";
import {
  IonButtons,
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
} from "@ionic/vue";

const exercice = new Exercice();
exercice.en_creation = true;

const createPresence = (present: boolean, remplace: boolean): Presence => {
  const presence = new Presence();
  presence.nom = "Test";
  presence.prenom = "georges";
  presence.present = present;
  presence.remplace = remplace;
  return reactive(presence);
};
exercice.sapeurs = [
  createPresence(false, false),
  createPresence(false, true),
  createPresence(true, false),
  createPresence(true, true),
];

const excusesTypes: ExcuseType[] = [
  {
    id: 1,
    designation: "Valable",
    abreviation: "Ok",
    amende: false,
    statut: 1,
    tri: 1,
  },
  {
    id: 2,
    designation: "Excuse valable",
    abreviation: "Exc",
    amende: false,
    statut: 1,
    tri: 2,
  },
  {
    id: 2,
    designation: "Excuse non-valable",
    abreviation: "KO",
    amende: true,
    statut: 1,
    tri: 2,
  },
];

const formatDate = (date: string) => {
  return moment(date).format("DD.MM.yy");
};
const validate = () => {
  //TODO:
};
const addSapeur = () => {
  //TODO:
};
const saveLocal = () => {
  //TODO:
};

const selectPresent = async (sapeur: Presence) => {
  console.log("Select present");
  sapeur.absent = false;
  sapeur.present = true;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = false;
  saveLocal();
};

const selectAbsent = async (sapeur: Presence) => {
  console.log("Select absent");
  sapeur.present = false;
  sapeur.absent = true;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = false;
  saveLocal();
};

const selectRemplace = async (sapeur: Presence) => {
  console.log("Select remplace");
  sapeur.absent = false;
  sapeur.present = false;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = true;
  saveLocal();
};

const selectExcuse = async (sapeur: Presence) => {
  console.log("Select excuse");
  sapeur.present = false;
  sapeur.absent = false;
  sapeur.remplace = false;
  sapeur.excuse = true;

  const buttons = excusesTypes.map((excuse) => ({
    text: excuse.designation,
    handler: () => {
      sapeur.excuse = true;
      sapeur.excuse_type_id = excuse.id;
      sapeur.excuse_type = excuse.designation;
      saveLocal();
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
};

const select = (sapeur: Presence, statut: number) => {
  if (statut == null) {
    // Unselect
  }
  console.log(statut);
  const actions = [selectPresent, selectAbsent, selectExcuse, selectRemplace];
  (actions[statut - 1] as any)(sapeur);
};

const reset = () => {
  //TODO: Reset les saisies
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            :defaultHref="{ name: 'exercices' }"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Exercices</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h3>
        {{
          exercice.communications != "-"
            ? exercice.communications
            : exercice.categorie
        }}
        - {{ formatDate(exercice.date) }}
      </h3>
      <!-- <p v-if="exercice.id_exe_lie != null">
        Lié à l'exercice
        {{
          exercice.communications != "-"
            ? exercice.communications
            : exercice.categorie
        }}
        - {{ formatDate(exerciceLie.date) }}
      </p>
      <ion-button
        block
        @click="linkExercice"
        v-if="!(exercice.id_exe_lie != null || !exercice.en_creation)"
      >
        Lier un exercice
      </ion-button> -->
      <!-- <ion-button
        block
        @click="unlinkExercice"
        v-if="
          !(
            exercice.id_exe_lie == null ||
            !exercice.en_creation ||
            !exerciceLie.en_creation
          )
        "
      >
        Délier l'exercice
      </ion-button> -->
      <ion-list>
        <ion-row class="sap-item list-header">
          <ion-col> Sapeur </ion-col>
          <ion-col class="col-radio">Présent</ion-col>
          <ion-col class="col-radio">Absent</ion-col>
          <ion-col class="col-radio">Excusé</ion-col>
          <ion-col class="col-radio">Remplacé</ion-col>
        </ion-row>

        <div class="sapeurs">
          <ion-radio-group
            @ionChange="(statut) => select(sapeur, statut.detail.value)"
            v-model="sapeur.presenceStatut"
            v-for="(sapeur, i) in exercice.sapeurs"
            :key="sapeur.id"
          >
            <ion-row class="sap-item" :class="i % 2 ? 'even-row' : 'odd-row'">
              <ion-col>
                {{ sapeur.nom }} {{ sapeur.prenom }}<br />
                <span v-if="sapeur.excuse_type" class="details">{{
                  sapeur.excuse_type
                }}</span>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio
                  :value="1"
                  :disabled="!exercice.en_creation"
                ></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio
                  :value="2"
                  :disabled="!exercice.en_creation"
                ></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio
                  :value="3"
                  :disabled="!exercice.en_creation"
                ></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio
                  :value="4"
                  :disabled="!exercice.en_creation"
                ></ion-radio>
              </ion-col>
            </ion-row>
          </ion-radio-group>
        </div>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button
              expand="block"
              @click="addSapeur"
              v-if="exercice.en_creation"
            >
              <ion-icon slot="start" name="add"></ion-icon>
              Ajouter une présence
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button
              expand="block"
              @click="reset"
              color="light"
              v-if="
                !(
                  exercice.id_exe_lie != null &&
                  (!exercice.en_creation || !exerciceLie.en_creation)
                )
              "
            >
              <ion-icon slot="start" name="refresh"></ion-icon>
              Réinitialiser
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button
              expand="block"
              @click="validate"
              v-if="exercice.en_creation"
            >
              <ion-icon slot="start" name="checkmark-circle"></ion-icon> Valider
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
  text-align: center;
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
}
</style>