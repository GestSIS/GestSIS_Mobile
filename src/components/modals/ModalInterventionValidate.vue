<script lang="ts" setup>
import { ref, defineProps } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonHeader,
  IonDatetime,
  IonDatetimeButton,
  IonContent,
  IonModal,
  IonButton,
  IonItem,
  IonLabel,
  modalController,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { useNotify } from "../../tools/useToast";
import { DateTime } from "luxon";

const notify = useNotify();

const props = defineProps<{ date: string }>();
const activeDate = ref(
  (
    props.date ??
    DateTime.now().toSQL({ includeOffset: false })?.slice(0, 16) ??
    ""
  ).replace(" ", "T")
);

const save = async () => {
  if (activeDate.value == "") {
    notify.error("Veuillez remplir tous les champs");
    return;
  }

  modalController.dismiss(activeDate.value.replace("T", " "));
};

const dismiss = () => {
  modalController.dismiss(false);
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Valider l'intervention</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-item>
      <ion-label class="ion-padding ion-text-wrap">
        ⚠️ Êtes-vous sûr de vouloir valider ce rapport d'intervention ? Les
        rapports d'interventions seront supprimés de la tablette une fois
        synchronisés.
      </ion-label>
    </ion-item>

    <ion-item no-lines>
      <ion-label>Date de fin</ion-label>
      <ion-datetime-button datetime="datetime"></ion-datetime-button>
    </ion-item>

    <ion-row>
      <ion-col>
        <ion-button expand="full" class="ion-margin-top" @click="dismiss">
          Annuler
        </ion-button>
      </ion-col>
      <ion-col>
        <ion-button expand="full" class="ion-margin-top" @click="save">
          Valider
        </ion-button>
      </ion-col>
    </ion-row>
    <ion-modal :keep-contents-mounted="true">
      <ion-datetime
        id="datetime"
        :value="activeDate"
        @ionChange="(ev: any) => activeDate = ev.detail.value"
      ></ion-datetime>
    </ion-modal>
  </ion-content>
</template>

<style></style>
