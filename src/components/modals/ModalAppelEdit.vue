<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Nouvel appel</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    <ion-list no-lines>
      <ion-item button="true" id="open-date-input">
        <ion-label position="fixed">Date</ion-label>
        <ion-text>{{ formatDate(appel.date, 'dd.LL.yy HH:mm') }}</ion-text>
        <ion-button fill="clear" slot="end">
          <ion-icon slot="end" name="calendar" />
        </ion-button>
        <ion-popover trigger="open-date-input" :show-backdrop="false">
          <ion-datetime
            presentation="time-date"
            @ionChange="(ev: any) => appel.date = DateTime.fromISO(ev.detail.value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''"
          />
        </ion-popover>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Numéro</ion-label>
        <ion-input v-model="appel.numero"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Nom</ion-label>
        <ion-input v-model="appel.nom"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="fixed">Commentaire</ion-label>
        <ion-textarea v-model="appel.commentaire"></ion-textarea>
      </ion-item>
    </ion-list>

    <ion-button expand="full" margin-top @click="save">Modifier</ion-button>
  </ion-content>
</template>


<script lang="ts" setup>
import { ref, defineProps } from "vue";
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
import { Appel } from "@/models/appel";
import { DateTime } from "luxon";
import useDateFormatter from "@/tools/useDateFormatter";

const { formatDate } = useDateFormatter();
const notify = useNotify();

const props = defineProps({
  appel: Appel
});

const appel = ref(props.appel || new Appel());

const isPhoneNumber = (str: string): boolean => {
  return /^(?=.*\d)[\d ]+$/.test(str);
}

const save = async () => {
  // TODO:
  if (appel.value?.nom == '' || appel.value.numero == '') {
    notify.error('Veuillez remplir tous les champs');
    return;
  } else if (!isPhoneNumber(appel.value.numero || '')) {
    notify.error("Numéro de téléphone invalid");
    return;
  }

  modalController.dismiss(appel.value);
}

const dismiss = () => {
  modalController.dismiss(null);
}

</script>

<style>
</style>
