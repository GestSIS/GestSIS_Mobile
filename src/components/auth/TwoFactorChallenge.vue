<script lang="ts" setup>
import { onMounted, ref } from "vue";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonList,
  loadingController,
} from "@ionic/vue";
import useAuth from "../../store/useAuth.ts";

// Étape de vérification 2FA d'un login ou d'une reconnexion (compte déjà
// protégé ; pas de configuration dans l'app). `done` : session établie et
// synchronisée. `cancel` : retour à la saisie du mot de passe, avec un message
// si la vérification ne peut plus aboutir (preAuthToken expiré, compte sans
// accès mobile…).
const emit = defineEmits<{
  done: [];
  cancel: [message?: string];
}>();

const {
  verifyTwoFactor,
  verifyWebauthnLogin,
  cancelTwoFactorChallenge,
  twoFactorAvailableMethods,
} = useAuth();

type Method = "totp" | "recovery" | "webauthn";
const methods = twoFactorAvailableMethods.value;
// null : sélecteur affiché (plusieurs méthodes disponibles).
const method = ref<Method | null>(methods.length === 1 ? (methods[0] as Method) : null);
const code = ref("");
const codeError = ref<string | null>(null);
const webauthnError = ref<string | null>(null);
// Vérification en cours (puis synchronisation initiale) : empêche un second
// envoi, qui rejouerait un code TOTP déjà consommé.
const busy = ref(false);

const choose = (next: Method | null) => {
  method.value = next;
  code.value = "";
  codeError.value = null;
  webauthnError.value = null;
};

const handleError = (error: unknown, setError: (message: string) => void, fallback: string) => {
  const { message, restart } = (error ?? {}) as { message?: string; restart?: boolean };
  if (restart) {
    emit("cancel", message);
    return;
  }
  setError(message ?? fallback);
};

const verifyCode = async () => {
  if (busy.value) {
    return;
  }
  // `required` sur ion-input ne bloque pas l'envoi du formulaire.
  if (code.value.trim() === "") {
    codeError.value = "Saisissez un code.";
    return;
  }
  busy.value = true;
  codeError.value = null;
  const loading = await loadingController.create({ message: "Chargement..." });
  await loading.present();
  try {
    await verifyTwoFactor(code.value);
    emit("done");
  } catch (error: unknown) {
    handleError(error, (message) => (codeError.value = message), "Code invalide");
  } finally {
    await loading.dismiss();
    busy.value = false;
  }
};

const verifyWebauthn = async () => {
  if (busy.value) {
    return;
  }
  choose("webauthn");
  busy.value = true;
  try {
    await verifyWebauthnLogin();
    emit("done");
  } catch (error: unknown) {
    handleError(
      error,
      (message) => (webauthnError.value = message),
      "Échec de la vérification par clé de sécurité.",
    );
  } finally {
    busy.value = false;
  }
};

const back = () => {
  cancelTwoFactorChallenge();
  emit("cancel");
};

// Seule méthode du compte : inutile d'attendre un clic.
onMounted(() => {
  if (method.value === "webauthn") {
    verifyWebauthn();
  }
});
</script>

<template>
  <div class="ion-padding">
    <h2>Double authentification</h2>

    <template v-if="method === null">
      <p>Choisissez une méthode de vérification.</p>
      <ion-button
        v-if="twoFactorAvailableMethods.includes('totp')"
        expand="block"
        fill="outline"
        class="ion-margin-bottom"
        @click="choose('totp')"
      >
        Code d'authentification
      </ion-button>
      <ion-button
        v-if="twoFactorAvailableMethods.includes('webauthn')"
        expand="block"
        fill="outline"
        class="ion-margin-bottom"
        @click="verifyWebauthn"
      >
        Clé de sécurité / biométrie
      </ion-button>
      <ion-button expand="block" fill="clear" @click="back"> Retour </ion-button>
    </template>

    <form v-else-if="method === 'totp' || method === 'recovery'" @submit.prevent="verifyCode">
      <p v-if="method === 'totp'">
        Entrez le code généré par votre application d'authentification, ou un de vos codes de
        secours.
      </p>
      <p v-else>Entrez un de vos codes de secours.</p>
      <ion-list class="ion-no-padding">
        <ion-item>
          <ion-input
            v-model="code"
            type="text"
            label-placement="floating"
            :label="method === 'totp' ? 'Code à 6 chiffres' : 'xxxx-xxxx'"
            autocomplete="one-time-code"
            autocapitalize="off"
            required
          />
        </ion-item>
      </ion-list>
      <p v-if="codeError" class="error-text">
        {{ codeError }}
      </p>
      <ion-button
        type="submit"
        expand="block"
        color="primary"
        class="ion-margin-top"
        :disabled="busy"
      >
        Valider
      </ion-button>
      <ion-button
        v-if="method === 'totp' && twoFactorAvailableMethods.length > 1"
        expand="block"
        fill="clear"
        @click="choose(null)"
      >
        Autre méthode
      </ion-button>
      <ion-button v-if="method === 'recovery'" expand="block" fill="clear" @click="verifyWebauthn">
        Utiliser ma clé de sécurité
      </ion-button>
      <ion-button expand="block" fill="clear" @click="back"> Retour </ion-button>
    </form>

    <template v-else>
      <p v-if="busy">Vérification en cours… Suivez les instructions de votre appareil.</p>
      <ion-card v-if="webauthnError" color="danger">
        <ion-card-content>{{ webauthnError }}</ion-card-content>
      </ion-card>
      <ion-button
        expand="block"
        color="primary"
        class="ion-margin-top"
        :disabled="busy"
        @click="verifyWebauthn"
      >
        Réessayer
      </ion-button>
      <ion-button
        v-if="twoFactorAvailableMethods.length > 1"
        expand="block"
        fill="clear"
        :disabled="busy"
        @click="choose(null)"
      >
        Autre méthode
      </ion-button>
      <ion-button expand="block" fill="clear" :disabled="busy" @click="choose('recovery')">
        Je n'ai plus accès à ma clé de sécurité
      </ion-button>
      <ion-button expand="block" fill="clear" :disabled="busy" @click="back"> Retour </ion-button>
    </template>
  </div>
</template>

<style scoped>
.error-text {
  color: var(--ion-color-danger);
}
</style>
