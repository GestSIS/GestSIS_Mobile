<script lang="ts" setup>
import { ref } from "vue";
import useAuth from "../../store/useAuth.ts";
import {
  IonToolbar,
  IonTitle,
  IonCol,
  IonRow,
  IonButtons,
  IonHeader,
  IonList,
  IonInput,
  IonContent,
  IonButton,
  IonItem,
  IonCard,
  IonCardContent,
  IonGrid,
  modalController,
} from "@ionic/vue";
import { useNotify } from "../../tools/useToast.ts";

const notify = useNotify();
const { reconnect, state } = useAuth();

const email = ref(state.data.email ?? "");
const password = ref("");

const wrappedReconnect = () => {
  if (!window.navigator.onLine) {
    return notify.error("Aucune connexion internet !");
  }
  reconnect(email.value, password.value)
    .then(() => {
      modalController.dismiss();
      notify.success("Reconnexion réussi avec succès");
    })
    .catch((error) => {
      notify.error(error?.message ?? "Identifiants incorrect");
    });
};

const dismiss = () => {
  modalController.dismiss();
};
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Reconnexion</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()"> Annuler </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-card color="warning">
      <ion-card-content>
        <ion-grid>
          <h2>
            ⚠️ Votre connexion a expirée, veuillez vous reconnecter pour pouvoir
            synchroniser votre travail.
          </h2>
        </ion-grid>
      </ion-card-content>
    </ion-card>

    <form @submit.prevent="wrappedReconnect">
      <ion-list class="ion-padding">
        <ion-item>
          <ion-input
            v-model="email"
            type="text"
            inputmode="email"
            name="email"
            placeholder="Adresse e-mail"
            :readonly="!!state.data.email"
            :disabled="!!state.data.email"
          />
        </ion-item>
        <ion-item>
          <ion-input
            v-model="password"
            type="password"
            name="password"
            placeholder="Mot de passe"
          />
        </ion-item>
        <ion-row>
          <ion-col col="6">
            <ion-button
              type="submit"
              color="primary"
              expand="block"
              class="ion-margin-top"
            >
              Connexion
            </ion-button>
          </ion-col>
          <ion-col col="6">
            <ion-button
              color="secondary"
              expand="block"
              class="ion-margin-top"
              @click="dismiss"
            >
              Continuer en mode hors-ligne
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </form>
  </ion-content>
</template>
