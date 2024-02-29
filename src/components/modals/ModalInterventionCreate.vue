<script lang="ts" setup>
import { reactive, ref } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonList,
  IonTextarea,
  IonButtons,
  IonHeader,
  IonInput,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from "@ionic/vue";
import { useNotify } from "@/tools/useToast";
import { DateTime } from "luxon";

import useInterventions from "@/store/useInterventions";
import useLocalites from "@/store/useLocalites";
import ModalLocaliteSelectVue from "./ModalLocaliteSelect.vue";
import BaseDatetime from "../base/BaseDatetime.vue";

const { newIntervention } = useInterventions();
const notify = useNotify();

const localiteStore = useLocalites();
const formatLocalite = (localiteId: number | null) => {
  const localite = localiteStore.state.value.find((l) => l.id == localiteId);
  return localite ? localite?.npa + " " + localite?.designation : "";
};

const selectLocalite = async () => {
  const modalLocaliteSelect = await modalController.create({
    component: ModalLocaliteSelectVue,
  });

  await modalLocaliteSelect.present();
  const { data } = await modalLocaliteSelect.onDidDismiss();

  if (!data) {
    return;
  }

  intervention.localite_id = data;
};

const intervention = reactive({
  date: DateTime.now().toSQL({ includeOffset: false })?.slice(0, 16) ?? "",
  objet: "",
  localite_id: null,
  lieu: "",
});

const errors: any = ref({});
const save = async () => {
  errors.value.date = !intervention.date;
  errors.value.objet = !intervention.objet;
  errors.value.localite_id = !intervention.localite_id;
  if (errors.value.date || errors.value.objet || !intervention.localite_id) {
    notify.error("Veuillez remplir tous les champs");
    return;
  }

  const inter = newIntervention(
    DateTime.fromSQL(intervention.date),
    intervention.objet,
    intervention.localite_id,
    intervention.lieu
  );
  modalController.dismiss(inter);
};

const dismiss = () => {
  modalController.dismiss(null);
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Nouvelle intervention</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list no-lines>
      <base-datetime v-model="intervention.date">Début</base-datetime>

      <ion-item>
        <ion-input
          v-model="intervention.objet"
          label="Objet"
          labelPlacement="fixed"
          :class="{ invalid: !!errors.objet }"
        ></ion-input>
      </ion-item>

      <ion-item @click="selectLocalite">
        <ion-input
          :value="formatLocalite(intervention.localite_id)"
          label="Localité"
          labelPlacement="fixed"
          :class="{ invalid: !!errors.localite_id }"
          readonly
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-textarea
          v-model="intervention.lieu"
          label="Adresse, lieu"
          labelPlacement="fixed"
          :class="{ invalid: !!errors.lieu }"
        ></ion-textarea>
      </ion-item>
    </ion-list>

    <ion-button expand="full" class="ion-margin-top" @click="save"
      >Créer</ion-button
    >
  </ion-content>
</template>

<style scoped>
.invalid {
  --color: var(--ion-color-primary);
}
</style>
