<script lang="ts" setup>
import { PresenceExercice, HeureExerciceType } from "@/models/bundle";
import useExerciceCategories from "@/store/useExerciceCategories";

import {
  IonButtons,
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
import useDateFormatter from "@/tools/useDateFormatter";
import useExexercices from "@/store/useExercices";
import { useRoute } from "vue-router";
import router from "@/router";
import useExcuseTypes from "@/store/useExcuseTypes";
import useSapeurs from "@/store/useSapeurs";
import { computed, nextTick, ref } from "vue";
import ModalSapeurSelectVue from "@/components/modals/ModalSapeurSelect.vue";
import useHeureExerciceTypes from "@/store/useHeureExerciceTypes";
import useUnitesType from "@/store/useUnitesTypes";

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
  }))
);

const formatCategorie = (categorieId: number) => {
  categories.value.find((c) => c.id == categorieId)?.designation;
};

const route = useRoute();
const exerciceUuid = route.params.uuid;

const exercice = ref(exercices.value.find((e) => e.localUuid == exerciceUuid));
if (!exercice.value) {
  router.back();
} else {
  // Compute data pour affichage
  exercice.value.sapeurs = exercice.value.sapeurs.map((p: any) => ({
    ...p,
    presenceStatut: p.present
      ? 1
      : p.absent
      ? 2
      : p.excuse_type_id
      ? 3
      : p.remplace
      ? 4
      : 0,
    excuse_type: p.excuse_type_id
      ? excusesTypes.value.find((e) => e.id == p.excuse_type_id)?.designation ||
        ""
      : "",
  }));
  exercice.value.initialSapeurs = exercice.value?.initialSapeurs.map(
    (p: any) => ({
      ...p,
      presenceStatut: p.present
        ? 1
        : p.absent
        ? 2
        : p.excuse_type_id
        ? 3
        : p.remplace
        ? 4
        : 0,
      excuse_type: p.excuse_type_id
        ? excusesTypes.value.find((e) => e.id == p.excuse_type_id)
            ?.designation || ""
        : "",
    })
  );
}

const computedSapeurs = computed(() =>
  exercice.value?.sapeurs
    .map((s) => {
      const nomPrenom = indexedSapeurs.get(s.sapeur_id);
      return { ...s, nomPrenom };
    })
    .sort((a, b) => a.nomPrenom.localeCompare(b.nomPrenom))
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
      exceptSapeurIds: exercice.value.sapeurs.map((s: any) => s?.sapeur_id),
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  const sapeurId = data;
  if (!sapeurId) {
    return;
  }

  exercice.value.sapeurs.push({
    id: null as any,
    sapeur_id: sapeurId,
    excuse_type_id: null as any,
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
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = false;
};

const selectAbsent = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.present = false;
  sapeur.absent = true;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = false;
};

const selectRemplace = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.absent = false;
  sapeur.present = false;
  sapeur.excuse = false;
  sapeur.excuse_type_id = null as any;
  sapeur.excuse_type = null as any;
  sapeur.remplace = true;
};

const selectExcuse = async (sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  sapeur.present = false;
  sapeur.absent = false;
  sapeur.remplace = false;
  sapeur.excuse = true;

  const buttons = excusesTypes.value.map((excuse) => ({
    text: excuse.designation,
    handler: () => {
      if (!exercice.value) return;
      sapeur.excuse = true;
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
};

const resetting = ref(false);
const select = async (statut: number, sapeur: PresenceExercice) => {
  if (!exercice.value) return;
  if (statut == null) {
    // Unselect
  }
  if (resetting.value) {
    return;
  }
  const actions = [selectPresent, selectAbsent, selectExcuse, selectRemplace];
  await actions[statut - 1](sapeur);

  // Save changes
  exercice.value.sapeurs = exercice.value.sapeurs.map((s) =>
    s.sapeur_id == sapeur.sapeur_id ? sapeur : s
  );
  exercicesStore.updatExercice(exercice.value);
};

const heureInput = (
  value: string | number,
  sapeur: PresenceExercice,
  heureType: HeureExerciceType
) => {
  if (!exercice.value) return;
  if (resetting.value) {
    return;
  }
  const quantite = parseFloat(`${value}`);
  if (quantite) {
    const heure = sapeur.heures.find(
      (h) => h.heure_exercice_type_id == heureType.id
    );
    sapeur.heures = [
      ...sapeur.heures.filter((h) => h.heure_exercice_type_id != heureType.id),
      { ...heure, quantite, heure_exercice_type_id: heureType.id, id: null },
    ];
  } else {
    sapeur.heures = sapeur.heures.filter(
      (h) => h.heure_exercice_type_id != heureType.id
    );
  }
  exercice.value.sapeurs = exercice.value.sapeurs.map((s) =>
    s.sapeur_id == sapeur.sapeur_id ? sapeur : s
  );
  console.log(sapeur);
  exercicesStore.updatExercice(exercice.value);
};

// Reset les saisies effectuées
const reset = () => {
  if (!exercice.value) return;
  resetting.value = true;
  exercice.value.sapeurs = [
    ...exercice.value.initialSapeurs.map((e: any) => ({ ...e })),
  ];
  exercice.value.localStatus = "empty";

  // Save changes
  exercicesStore.updatExercice(exercice.value, true);
  nextTick(() => {
    resetting.value = false;
  });
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
          exercice?.designation != "-"
            ? exercice?.designation
            : formatCategorie(exercice?.exercice_categorie_id)
        }}
        - {{ formatDate(exercice?.date || "", "DD.MM.yy") }}
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
          <ion-col v-for="heure in heuresTypes" :key="heure.id">{{
            heure.designation
          }}</ion-col>
        </ion-row>

        <div class="sapeurs">
          <ion-radio-group
            v-for="(sapeur, i) in computedSapeurs"
            :key="sapeur.id"
            v-model="sapeur.presenceStatut"
            @ionChange="select($event.target.value, sapeur)"
          >
            <ion-row class="sap-item" :class="i % 2 ? 'even-row' : 'odd-row'">
              <ion-col>
                {{ sapeur?.nomPrenom }}
                <br />
                <span v-if="sapeur.excuse_type" class="details">{{
                  sapeur.excuse_type
                }}</span>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="1"></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="2"></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="3"></ion-radio>
              </ion-col>
              <ion-col class="col-radio">
                <ion-radio mode="md" :value="4"></ion-radio>
              </ion-col>
              <ion-col v-for="heure in enhancedHeuresTypes" :key="heure.id">
                <ion-item lines="none">
                  <!-- {{ sapeur?.heures.length > 0 ? sapeur?.heures[0].heure_exercice_type_id : '' }} -->
                  <ion-input
                    type="number"
                    inputmode="numeric"
                    :value="
                      sapeur?.heures.find(
                        (h) => h.heure_exercice_type_id == heure.id
                      )?.quantite
                    "
                    @ionChange.stop="
                      heureInput($event.target.value ?? '', sapeur, heure)
                    "
                  ></ion-input>
                  <ion-label slot="end">{{ heure.abreviation }}</ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-radio-group>
          <ion-row>
            <ion-col>Total : {{ computedSapeurs?.length }}</ion-col>
          </ion-row>
        </div>
      </ion-list>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="addSapeur">
              <ion-icon slot="start" name="add"></ion-icon>Ajouter une présence
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button
              expand="block"
              @click="reset"
              color="light"
              :disabled="exercice?.localStatus == 'empty'"
            >
              <ion-icon slot="start" name="refresh"></ion-icon>Réinitialiser
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button
              expand="block"
              @click="validate"
              v-if="exercice?.localStatus != 'validated'"
              :disabled="exercice?.localStatus == 'empty'"
            >
              <ion-icon slot="start" name="checkmark-circle"></ion-icon>Valider
            </ion-button>
            <!-- TODO: Optionnel Ajouter bouton synchroniser pour exporter l'exercice ?  -->
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
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--ion-color-light-shade);
}
</style>
