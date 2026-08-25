<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Jalons</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          :disabled="intervention.localStatus == 'validated'"
          @click="addJalonEntry()"
        >
          <ion-icon slot="start" :icon="add" aria-hidden="true" />Nouveau jalon
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-list>
    <ion-item v-if="!intervention.jalons.length"> Aucun jalon </ion-item>
    <ion-item
      v-for="jalon in sortedJalons"
      :key="jalon.localUuid"
      :button="true"
      :disabled="intervention.localStatus == 'validated'"
      @click="editJalonEntry(jalon)"
    >
      <p>
        {{ jalon.titre }}
        <br />
        <span class="details"
          >{{ formatDate(jalon.date_time, "HH:mm 'le' dd.MM.yyyy") }}<template
            v-if="jalon.sapeur?.designation"
          >
            - {{ jalon.sapeur.designation }}</template
          ></span
        >
        <br />
        <span class="details">{{ jalon.description }}</span>
      </p>
      <ion-button
        slot="end"
        fill="clear"
        color="dark"
        :disabled="intervention.localStatus == 'validated'"
        aria-label="Fermer"
        @click.stop="removeJalonEntry(jalon)"
      >
        <ion-icon slot="icon-only" :icon="close" aria-hidden="true" />
      </ion-button>
    </ion-item>
  </ion-list>
</template>

<script lang="ts" setup>
import {
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonItem,
  IonIcon,
  modalController,
  alertController,
} from "@ionic/vue";
import { add, close } from "ionicons/icons";

import useActiveIntervention from "../../store/useActiveIntervention.ts";
import useDateFormatter from "../../tools/useDateFormatter.ts";
import type { Jalon } from "../../models/jalon.ts";
import ModalJalonEditVue from "../modals/ModalJalonEdit.vue";
import { computed } from "vue";

const { formatDate } = useDateFormatter();
const { state, removeJalon } = useActiveIntervention();
const intervention = state;

const sortedJalons = computed(() =>
  intervention.value.jalons
    .slice()
    .sort((a, b) => b.date_time.localeCompare(a.date_time)),
);

const addJalonEntry = async () => {
  const modalJalon = await modalController.create({
    component: ModalJalonEditVue,
  });

  await modalJalon.present();
};

const editJalonEntry = async (jalon: Jalon) => {
  const modalJalon = await modalController.create({
    component: ModalJalonEditVue,
    componentProps: {
      jalon: { ...jalon },
    },
  });

  await modalJalon.present();
};

const removeJalonEntry = async (jalon: Jalon) => {
  const confirm = await alertController.create({
    header: "Supprimer jalon",
    message:
      "Êtes-vous sûr de vouloir supprimer le jalon [" + jalon.titre + "] ?",
    buttons: [
      {
        text: "Non",
      },
      {
        text: "Oui",
        handler: () => {
          removeJalon(jalon);
        },
      },
    ],
  });
  await confirm.present();
};
</script>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
