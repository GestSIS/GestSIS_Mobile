<script lang="ts" setup>
import { defineProps, ref, reactive } from "vue";
import {
  IonToolbar,
  IonIcon,
  IonLabel,
  IonText,
  IonModal,
  IonDatetime,
  IonInput,
  IonTitle,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from '@ionic/vue';

import { DateTime } from "luxon";
import useDateFormatter from "@/tools/useDateFormatter";

const { formatDate } = useDateFormatter();

interface Presence {
  sapeur_id: null
  nom: string,
  prenom: string,
  date_debut: string,
  date_fin: string,
}

const props: Presence = defineProps<Presence>();
const presence = reactive({ ...props })

const dismiss = () => {
  modalController.dismiss(null);
}

const datetimeDebut = ref();
const datetimeFin = ref();

const openModalDebut = ref(false);
const openModalFin = ref(false);

const confirm = () => {
  if (datetimeFin.value === undefined) return;
  datetimeFin.value.$el.confirm();
  openModalFin.value = false;
};

const reset = () => {
  if (datetimeFin.value === undefined) return;

  datetimeFin.value.$el.reset();
  presence.date_fin = "";
  openModalFin.value = false;
};

const save = () => {
  modalController.dismiss(presence);
}

// const searchbar = ref<ComponentPublicInstance<HTMLInputElement>>();
// onMounted(() => {
//   searchbar.value?.$el.setFocus();
// })

const computeCurrentDate = (): DateTime => {
  // Défault à heure actuelle
  let date = DateTime.now();
  date = date.set({ minute: date.minute + 15 - (date.minute % 15), second: 0, millisecond: 0 });
  return date;
}
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="dismiss()">
          <ion-icon name="arrow-back"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Détails d'une présence</ion-title>

      <ion-buttons slot="end">
        <ion-button @click="save()">Enregistrer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list>
      <ion-item>
        <ion-label fixed>Sapeur</ion-label>
        <ion-input type="text" readonly="true" :value="presence.nom + ' ' + presence.prenom"></ion-input>
      </ion-item>

      <ion-item @click="openModalDebut = !openModalDebut">
        <ion-label>Heure d'arrivée</ion-label>
        <ion-text
          slot="end"
          id="open-modal"
        >{{ presence.date_debut ? formatDate(presence.date_debut, 'dd.LL.yy HH:mm') : '' }}</ion-text>
        <ion-button fill="clear" slot="end">
          <ion-icon slot="end" name="calendar" />
        </ion-button>
        <ion-modal :is-open="openModalDebut">
          <ion-datetime
            ref="datetimeDebut"
            presentation="time-date"
            minuteValues="0,15,30,45"
            :value="DateTime.fromSQL(presence.date_debut).toISO()"
            @ionChange="(ev: any) => presence.date_debut = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
          />
        </ion-modal>
      </ion-item>

      <ion-item @click="openModalFin = !openModalFin">
        <ion-label>Heure de départ</ion-label>
        <ion-text
          slot="end"
          id="open-modal"
        >{{ presence.date_fin ? formatDate(presence.date_fin, 'dd.LL.yy HH:mm') : '' }}</ion-text>
        <ion-button fill="clear" slot="end">
          <ion-icon slot="end" name="calendar" />
        </ion-button>
        <ion-modal :is-open="openModalFin">
          <ion-datetime
            ref="datetimeFin"
            presentation="time-date"
            minuteValues="0,15,30,45"
            :min="DateTime.fromSQL(presence.date_debut).toISO()"
            :value="presence.date_fin ? DateTime.fromSQL(presence.date_fin).toISO() : computeCurrentDate().toISO()"
            @ionChange="(ev: any) => presence.date_fin = DateTime.fromISO(ev.detail.value || '')?.toSQL({ includeOffset: false })?.slice(0, 16) || ''"
          >
            <ion-buttons slot="buttons">
              <ion-button @click="confirm()">Valider</ion-button>
              <ion-button @click="reset()">Reset</ion-button>
            </ion-buttons>
          </ion-datetime>
        </ion-modal>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style>
</style>