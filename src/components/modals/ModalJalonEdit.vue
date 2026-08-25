<script lang="ts" setup>
import { ref } from "vue";
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
import { useNotify } from "../../tools/useToast.ts";
import { Jalon } from "../../models/jalon.ts";
import useActiveIntervention from "../../store/useActiveIntervention.ts";
import BaseDatetime from "../base/BaseDatetime.vue";

const notify = useNotify();

const { addJalon, updateJalon } = useActiveIntervention();
const props = defineProps<{ jalon?: Jalon }>();

const activeJalon = ref(props.jalon || new Jalon());

const save = async () => {
  if (
    activeJalon.value.titre == "" ||
    activeJalon.value.date_time == ""
  ) {
    notify.error("Veuillez remplir tous les champs");
    return;
  }

  if (activeJalon.value.localUuid == "") {
    addJalon(activeJalon.value);
  } else {
    updateJalon(activeJalon.value);
  }
  modalController.dismiss();
};

const dismiss = () => {
  modalController.dismiss();
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{
        activeJalon.localUuid == "" ? "Nouveau jalon" : "Modifier jalon"
      }}</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()"> Annuler </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list no-lines>
      <base-datetime v-model="activeJalon.date_time"> Date </base-datetime>

      <ion-item>
        <ion-input
          v-model="activeJalon.titre"
          label="Titre"
          label-placement="fixed"
        />
      </ion-item>

      <ion-item>
        <ion-textarea
          v-model="activeJalon.description"
          label="Description"
          label-placement="fixed"
        />
      </ion-item>
    </ion-list>

    <ion-button expand="full" class="ion-margin-top" @click="save">
      {{ activeJalon.localUuid == "" ? "Ajouter" : "Modifier" }}
    </ion-button>
  </ion-content>
</template>

<style></style>
