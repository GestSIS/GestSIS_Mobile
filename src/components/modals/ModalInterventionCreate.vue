<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Nouvelle intervention</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    <ion-list no-lines>
      <ion-item button="true" id="open-date-input">
        <ion-label position="fixed">Date</ion-label>
        <ion-text>{{ formatDate(intervention.date, 'dd.LL.yy HH:mm') }}</ion-text>
        <ion-button fill="clear" slot="end">
          <ion-icon slot="end" name="calendar" />
        </ion-button>
        <ion-popover trigger="open-date-input" :show-backdrop="false">
          <ion-datetime
            presentation="time-date"
            @ionChange="(ev: any) => intervention.date = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
          />
        </ion-popover>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Objet</ion-label>
        <ion-input v-model="intervention.objet"></ion-input>
      </ion-item>

      <ion-item @click="selectLocalite">
        <ion-label position="fixed">Localité</ion-label>
        <ion-input :value="formatLocalite(intervention.localite_id)" readonly></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Adresse, lieu</ion-label>
        <ion-textarea v-model="intervention.lieu"></ion-textarea>
      </ion-item>
    </ion-list>

    <ion-button expand="full" margin-top @click="save">Créer</ion-button>
  </ion-content>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonList,
  IonTextarea,
  IonButtons,
  IonHeader,
  IonLabel,
  IonPopover,
  IonIcon,
  IonDatetime,
  IonInput,
  IonText,
  IonContent,
  IonButton,
  IonItem,
  modalController,
} from '@ionic/vue';
import { useNotify } from "@/tools/useToast";
import { DateTime } from "luxon";
import useDateFormatter from "@/tools/useDateFormatter";

import useInterventions from "@/store/useInterventions";
import useLocalites from "@/store/useLocalites";
import ModalLocaliteSelectVue from "./ModalLocaliteSelect.vue";

const { newIntervention } = useInterventions();
const { formatDate } = useDateFormatter();
const notify = useNotify();

const localiteStore = useLocalites();
const formatLocalite = (localiteId: number | null) => {
  const localite = localiteStore.state.value.find(l => l.id == localiteId);
  return localite ? localite?.npa + " " + localite?.designation : ""
}

const selectLocalite = async () => {
  const modalLocaliteSelect = await modalController
    .create({
      component: ModalLocaliteSelectVue,
      componentProps: {
        exceptSapeurIds: [],
      }
    })

  await modalLocaliteSelect.present();
  let { data } = await modalLocaliteSelect.onDidDismiss();

  if (!data) {
    return;
  }

  intervention.localite_id = data;
}

const intervention = reactive({
  date: DateTime.now().toSQL({ includeOffset: false }).slice(0, 16),
  objet: '',
  localite_id: null,
  lieu: '',
});

const save = async () => {
  // TODO: valider les différents champs
  if (intervention.date == '' || intervention.objet == '' || !intervention.localite_id) {
    notify.error('Veuillez remplir tous les champs');
    return;
  }

  const inter = newIntervention(DateTime.fromSQL(intervention.date), intervention.objet, intervention.localite_id, intervention.lieu);
  modalController.dismiss(inter);
}

const dismiss = () => {
  modalController.dismiss(null);
}

</script>

<style>
</style>
