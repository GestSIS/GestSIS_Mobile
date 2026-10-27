<script lang="ts" setup>
import { useRouter } from "vue-router";
import useAuth, { UserStatus } from "../store/useAuth.ts";
import {
  IonCard,
  IonCardContent,
  IonGrid,
  IonContent,
  IonPage,
  IonTitle,
  IonItem,
  IonInput,
  IonList,
  IonHeader,
  IonToolbar,
  IonButton,
  loadingController,
} from "@ionic/vue";
import { ref, watchEffect } from "vue";
import { useNotify } from "../tools/useToast.ts";
import TwoFactorChallenge from "../components/auth/TwoFactorChallenge.vue";

const router = useRouter();
const email = ref("");
const password = ref("");

const { login, state } = useAuth();

// If connected redirect to home page
watchEffect(() => {
  if (state.data.statut == UserStatus.connected && router.currentRoute.value.name == "login") {
    router.push({ name: "accueil" });
  }
});

// 'credentials' -> 'challenge' (compte déjà protégé par 2FA), voir
// TwoFactorChallenge.vue. Pas de flux de configuration ici : un compte dont la
// configuration est obligatoire est refusé par login() (voir useAuth.ts).
const step = ref<"credentials" | "challenge">("credentials");

const wrappedLogin = async () => {
  const notify = useNotify();
  if (!window.navigator.onLine) {
    return notify.error("Aucune connexion internet !");
  }

  // Afficher loading
  const loading = await loadingController.create({
    cssClass: "my-custom-class",
    message: "Chargement...",
  });
  await loading.present();

  try {
    // login() attend aussi la synchronisation initiale
    const result = await login(email.value, password.value);

    if (result.requiresTwoFactor) {
      step.value = "challenge";
      return;
    }

    router.push({ name: "accueil" });
  } catch (error: unknown) {
    notify.error((error as { message?: string })?.message ?? "Identifiants incorrect");
    // errorMessage.value = error?.message ?? "Identifiants incorrect";
  } finally {
    await loading.dismiss();
  }
};

const onChallengeCancel = (message?: string) => {
  step.value = "credentials";
  if (message) {
    useNotify().error(message);
  }
};

const online = window.navigator.onLine;
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card v-if="!online" color="warning">
        <ion-card-content>
          <ion-grid>
            <h2>⚠️ Aucune connexion internet détectée</h2>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <form v-if="step === 'credentials'" @submit.prevent="wrappedLogin">
        <ion-list class="ion-padding">
          <ion-item>
            <ion-input
              v-model="email"
              type="text"
              label-placement="floating"
              label="Adresse e-mail"
              inputmode="email"
              name="email"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="password"
              type="password"
              label-placement="floating"
              label="Mot de passe"
              name="password"
            />
          </ion-item>
          <ion-button type="submit" color="primary" expand="block" class="ion-margin-top">
            Connexion
          </ion-button>
        </ion-list>
      </form>

      <two-factor-challenge
        v-else
        @done="router.push({ name: 'accueil' })"
        @cancel="onChallengeCancel"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
