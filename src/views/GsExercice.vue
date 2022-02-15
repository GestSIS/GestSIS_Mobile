<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'exercices' }"></ion-back-button>
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
        - {{ formatDate(exercice?.date || "", "DD.MM.yy") }}
        <!-- {{ exercice.sapeurs[0] }} -->
      </h3>
      <!-- <p v-if="exercice?.id_exe_lie != null">
        Lié à l'exercice
        {{
          exercice?.communications != "-"
            ? exercice?.communications
            : exercice?.categorie
        }}
        - {{ formatDate(exerciceLie.date) }}
      </p>
      <ion-button
        block
        @click="linkExercice"
        v-if="!(exercice?.id_exe_lie != null || !exercice?.en_creation)"
      >
        Lier un exercice
      </ion-button>-->
      <!-- <ion-button
        block
        @click="unlinkExercice"
        v-if="
          !(
            exercice?.id_exe_lie == null ||
            !exercice?.en_creation ||
            !exerciceLie.en_creation
          )
        "
      >
        Délier l'exercice
      </ion-button>-->

      <ion-list>
        <ion-row class="sap-item list-header">
          <ion-col>Sapeur</ion-col>
          <ion-col class="col-radio">Présent</ion-col>
          <ion-col class="col-radio">Absent</ion-col>
          <ion-col class="col-radio">Excusé</ion-col>
          <ion-col class="col-radio">Remplacé</ion-col>
        </ion-row>

        <div class="sapeurs">
          <ion-radio-group
            v-model="sapeur.presenceStatut"
            v-for="(sapeur, i) in exercice?.sapeurs"
            @ionChange="select(sapeur, $event.target.value)"
            :key="sapeur.id"
          >
            <ion-row class="sap-item" :class="i % 2 ? 'even-row' : 'odd-row'">
              <ion-col>
                {{ indexedSapeurs.get(sapeur?.sapeur_id) || "" }}
                <br />
                <span v-if="sapeur.excuse_type" class="details">{{ sapeur.excuse_type }}</span>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio :value="1" :disabled="!exercice?.en_creation"></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio :value="2" :disabled="!exercice?.en_creation"></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio :value="3" :disabled="!exercice?.en_creation"></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio :value="4" :disabled="!exercice?.en_creation"></ion-radio>
              </ion-col>
            </ion-row>
          </ion-radio-group>
        </div>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="addSapeur" v-if="exercice?.en_creation">
              <ion-icon slot="start" name="add"></ion-icon>Ajouter une présence
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="reset" color="light" v-if="exercice?.en_creation">
              <ion-icon slot="start" name="refresh"></ion-icon>Réinitialiser
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" @click="validate" v-if="exercice?.en_creation">
              <ion-icon slot="start" name="checkmark-circle"></ion-icon>Valider
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>

import { PresenceExercice } from "@/models/bundle";
import useExerciceCategories from "@/store/useExerciceCategories";

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
  modalController,
} from "@ionic/vue";
import useDateFormatter from "@/tools/useDateFormatter";
import useExexercices from "@/store/useExercices";
import { useRoute } from "vue-router";
import router from "@/router";
import useExcuseTypes from "@/store/useExcuseTypes";
import useSapeurs from "@/store/useSapeurs";
import { nextTick, ref } from "vue";
import ModalSapeurSelectVue from "@/components/modals/ModalSapeurSelect.vue";

const { formatDate } = useDateFormatter();

const exercicesStore = useExexercices();
const categoriesStore = useExerciceCategories();
const excuseTypesStore = useExcuseTypes();
const sapeursStore = useSapeurs();

const exercices = exercicesStore.state;
const categories = categoriesStore.state;
const excusesTypes = excuseTypesStore.state;
const sapeurs = sapeursStore.state;
const indexedSapeurs = sapeurs.value.reduce((map, e) => {
  map.set(e.id, e.nom + " " + e.prenom)
  return map;
}, new Map())

const formatCategorie = (categorieId: number) => {
  categories.value.find(c => c.id == categorieId)?.designation
}

const route = useRoute();
const exerciceUuid = route.params.uuid;

const exercice = ref(exercices.value.find(e => e.localUuid == exerciceUuid)) as any;
if (!exercice.value) {
  console.log("going back !!! Invalid Exercice UUID")
  router.back();
} else {
  if (!exercice.value?.en_creation) {
    exercice.value.en_creation = true;
    exercicesStore.updatExercice(exercice.value);
  }

  // Compute data pour affichage
  exercice.value.sapeurs = exercice.value.sapeurs.map((p: any) => ({
    ...p,
    presenceStatut: p.present ? 1 : p.absent ? 2 : p.excuse_type_id ? 3 : p.remplace ? 4 : 0,
    excuse_type: p.excuse_type_id ? excusesTypes.value.find(e => e.id == p.excuse_type_id)?.designation || "" : ""
  }))
  exercice.value.initialSapeurs = exercice.value?.initialSapeurs.map((p: any) => ({
    ...p,
    presenceStatut: p.present ? 1 : p.absent ? 2 : p.excuse_type_id ? 3 : p.remplace ? 4 : 0,
    excuse_type: p.excuse_type_id ? excusesTypes.value.find(e => e.id == p.excuse_type_id)?.designation || "" : ""
  }))
}

const validate = () => {
  //TODO:
};

const addSapeur = async () => {
  const modalSapeurSelect = await modalController
    .create({
      component: ModalSapeurSelectVue,
      componentProps: {
        exceptSapeurIds: exercice.value.sapeurs.map((s: any) => s?.sapeur_id),
      },
    })

  await modalSapeurSelect.present();
  let { data } = await modalSapeurSelect.onDidDismiss();

  const sapeurId = data;
  if (!sapeurId) {
    return;
  }

  exercice.value.sapeurs.push({
    "id": null,
    "sapeur_id": sapeurId,
    "exercice_id": null,
    "excuse_type_id": null,
    "convoque": null,
    "present": true,
    "amende": false,
    "remplace": false,
    "presenceStatut": 0,
    "excuse_type": "",
    "absent": false,
    "excuse": false
  });
  exercicesStore.updatExercice(exercice); 0
};
const saveLocal = () => {
  //TODO:
};

const selectPresent = async (sapeur: PresenceExercice) => {
  console.log("Select present");
  sapeur.absent = false;
  sapeur.present = true;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = false;
  saveLocal();
};

const selectAbsent = async (sapeur: PresenceExercice) => {
  console.log("Select absent");
  sapeur.present = false;
  sapeur.absent = true;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = false;
  saveLocal();
};

const selectRemplace = async (sapeur: PresenceExercice) => {
  console.log("Select remplace");
  sapeur.absent = false;
  sapeur.present = false;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = true;
  saveLocal();
};

const selectExcuse = async (sapeur: PresenceExercice) => {
  console.log("Select excuse");
  sapeur.present = false;
  sapeur.absent = false;
  sapeur.remplace = false;
  sapeur.excuse = true;

  const buttons = excusesTypes.value.map((excuse) => ({
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

let resetting = ref(false);
const select = async (sapeur: any, statut: number) => {
  if (statut == null) {
    // Unselect
  }
  if (resetting.value) {
    return;
  }
  const actions = [selectPresent, selectAbsent, selectExcuse, selectRemplace];
  await (actions[statut - 1])(sapeur);

  // Save changes
  exercicesStore.updatExercice(exercice);
};

// Reset les saisies effectuées
const reset = () => {
  resetting.value = true;
  exercice.value.sapeurs = [...exercice.value.initialSapeurs.map((e: any) => ({ ...e }))];
  exercice.value.en_creation = true;

  // Save changes
  exercicesStore.updatExercice(exercice);
  nextTick(() => {
    resetting.value = false;
  })
};
</script>

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