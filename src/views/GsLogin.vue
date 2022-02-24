<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="wrappedLogin">
        <ion-list>
          <ion-item>
            <ion-input
              type="text"
              inputmode="email"
              v-model="email"
              name="email"
              placeholder="Adresse e-mail"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="password"
              v-model="password"
              name="password"
              placeholder="Mot de passe"
            ></ion-input>
          </ion-item>
          <!-- <ion-item>
            <ion-label>SIS</ion-label>
            <ion-select
              name="sis"
              cancelText="Annuler"
              okText="Valider"
              v-model="account.sisId"
              ref="sisSelect"
            >
              <ion-select-option
                v-for="sis in listeSis"
                :value="sis.id"
                :key="sis.id"
                >{{ sis.nom }}</ion-select-option
              >
            </ion-select>
          </ion-item>-->
          <ion-button type="submit" color="primary" expand="block" class="ion-margin-top">Connexion</ion-button>
        </ion-list>
      </form>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import useAuth, { UserStatus } from '@/store/useAuth';
import {
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
} from '@ionic/vue';
import { ref, watch, watchEffect, computed } from 'vue';
import useStore from '@/store/useStore';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const { login, state } = useAuth();

// If connected redirect to home page
const stopRedirect = watchEffect((onInvalidate) => {
  if (state.data.statut == UserStatus.connected && router.currentRoute.value.name == 'login') {
    router.push({ name: 'accueil' });
  }
});

const wrappedLogin = async () => {
  try {
    await login(email.value, password.value);

    // Afficher loading
    const loading = await loadingController
      .create({
        cssClass: 'my-custom-class',
        message: 'Chargement...',
      });

    await loading.present();

    // Load data
    const store = useStore()
    await store.loadAll();

    // Hide loading
    await loading.dismiss();

    router.push({ name: 'accueil' });
  } catch (error) {
    errorMessage.value = error as string;
  }
};
</script>

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
