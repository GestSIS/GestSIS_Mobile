<script lang="ts" setup>
import { type Ref, ref } from "vue";
import {
  IonPage,
  IonTitle,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonList,
  IonInput,
  IonTextarea,
  IonContent,
  IonButton,
  IonItem,
  IonBackButton,
  modalController,
} from "@ionic/vue";
import { Mission } from "../models/mission.ts";
import { useRoute, useRouter } from "vue-router";
import useActiveIntervention from "../store/useActiveIntervention.ts";

import ModalSapeurSelectVue from "../components/modals/ModalSapeurSelect.vue";
import ModalMissionSelectVue from "../components/modals/ModalMissionSelect.vue";
import useSapeurs from "../store/useSapeurs.ts";
import { DateTime } from "luxon";
import { useNotify } from "../tools/useToast.ts";
import BaseDatetime from "../components/base/BaseDatetime.vue";

const notify = useNotify();
const sapeurModule = useSapeurs();

const router = useRouter();
const route = useRoute();
const missionUuid = route.params.uuid;
const interventionStore = useActiveIntervention();

const foundMission = interventionStore.state.value.missions.find(
  (m) => m.localUuid == missionUuid,
);
// Start from a full Mission (with all model defaults), overlaying the existing
// mission's values when editing. We must NOT do `Object.assign({}, found)`:
// when `found` is undefined (new mission) it returns a truthy `{}`, so the
// `|| new Mission()` fallback never ran and new missions lacked every default.
const mission: Ref<Mission> = ref(
  foundMission ? Object.assign(new Mission(), foundMission) : new Mission(),
);
if (!mission.value.date_debut) {
  mission.value.date_debut =
    DateTime.now().toSQL({ includeOffset: false })?.slice(0, 16) ?? "";
}

const title = foundMission ? "Détail mission" : "Nouvelle mission";

const isInputComplete = () => {
  return (
    mission.value.date_debut &&
    mission.value.titre &&
    mission.value.sapeur?.designation
  );
};

const selectSapeur = async () => {
  const modalSapeurSelect = await modalController.create({
    component: ModalSapeurSelectVue,
    componentProps: {
      exceptSapeurIds: [],
      preSelectionSapeurIds: interventionStore.state.value.sapeurs.map(
        (s) => s.id,
      ),
      autre: true,
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  if (!data) {
    return;
  }

  if (typeof data == "object") {
    mission.value.sapeur = {
      id: null,
      designation: data?.designation,
    };
  } else {
    const sapeur = sapeurModule.state.value.find((s) => s.id == data);
    mission.value.sapeur = {
      id: data,
      designation: `${sapeur?.nom} ${sapeur?.prenom}` || "",
    };
  }
};

const selectTitre = async () => {
  const modalTitreMission = await modalController.create({
    component: ModalMissionSelectVue,
  });

  await modalTitreMission.present();
  const { data } = await modalTitreMission.onDidDismiss();

  if (!data) {
    return;
  }
  mission.value.titre = data.titre;
};

const save = () => {
  if (!isInputComplete()) {
    notify.error("Veuillez compléter tous les champs");
    return;
  }
  if (mission.value.localUuid) {
    interventionStore.updateMission(mission.value);
  } else {
    interventionStore.addMission(mission.value);
  }
  router.back();
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="{ name: 'intervention' }" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          <ion-button slot="end" @click="save()"> Enregistrer </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <base-datetime v-model="mission.date_debut" :max="mission.date_fin">
          Début
        </base-datetime>

        <ion-item>
          <ion-input
            type="text"
            label="Responsable"
            label-placement="floating"
            :readonly="true"
            :value="mission.sapeur?.designation"
            @click="selectSapeur()"
          />
        </ion-item>

        <ion-item>
          <ion-input
            type="text"
            label="Mission"
            label-placement="floating"
            :value="mission.titre"
            @click="selectTitre()"
          />
        </ion-item>

        <ion-item>
          <ion-textarea
            v-model="mission.resume"
            label="Résumé"
            label-placement="floating"
            :rows="10"
            :auto-grow="true"
          />
        </ion-item>

        <base-datetime
          v-model="mission.date_fin"
          :min="mission.date_debut"
          :clearable="true"
        >
          Quittancer
        </base-datetime>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style></style>
