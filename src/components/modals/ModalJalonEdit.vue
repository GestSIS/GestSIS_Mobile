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
  IonIcon,
  IonItem,
  modalController,
} from "@ionic/vue";
import { close } from "ionicons/icons";
import { useNotify } from "../../tools/useToast.ts";
import { Jalon } from "../../models/jalon.ts";
import useActiveIntervention from "../../store/useActiveIntervention.ts";
import useSapeurs from "../../store/useSapeurs.ts";
import BaseDatetime from "../base/BaseDatetime.vue";
import ModalSapeurSelectVue from "./ModalSapeurSelect.vue";

const notify = useNotify();
const sapeurModule = useSapeurs();

const { addJalon, updateJalon } = useActiveIntervention();
const props = defineProps<{ jalon?: Jalon }>();

const activeJalon = ref(props.jalon || new Jalon());

const selectSapeur = async () => {
  const modalSapeurSelect = await modalController.create({
    component: ModalSapeurSelectVue,
    componentProps: {
      exceptSapeurIds: [],
      autre: true,
    },
  });

  await modalSapeurSelect.present();
  const { data } = await modalSapeurSelect.onDidDismiss();

  if (!data) {
    return;
  }

  if (typeof data == "object") {
    activeJalon.value.sapeur = {
      id: null,
      designation: data?.designation,
    };
  } else {
    const sapeur = sapeurModule.state.value.find((s) => s.id == data);
    activeJalon.value.sapeur = {
      id: data,
      designation: `${sapeur?.nom} ${sapeur?.prenom}` || "",
    };
  }
};

const clearSapeur = () => {
  activeJalon.value.sapeur = { id: null, designation: null };
};

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
          :rows="10"
          :auto-grow="true"
        />
      </ion-item>

      <ion-item>
        <ion-input
          type="text"
          label="Sapeur"
          label-placement="fixed"
          :readonly="true"
          :value="activeJalon.sapeur?.designation"
          @click="selectSapeur()"
        />
        <ion-button
          v-if="activeJalon.sapeur?.designation"
          slot="end"
          fill="clear"
          color="dark"
          aria-label="Effacer le sapeur"
          @click.stop="clearSapeur()"
        >
          <ion-icon slot="icon-only" :icon="close" aria-hidden="true" />
        </ion-button>
      </ion-item>
    </ion-list>

    <ion-button expand="full" class="ion-margin-top" @click="save">
      {{ activeJalon.localUuid == "" ? "Ajouter" : "Modifier" }}
    </ion-button>
  </ion-content>
</template>

<style></style>
