<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :defaultHref="{ name: 'accueil' }"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ $route.params.id }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="none">
        <ion-item>
          <ion-avatar slot="end">
            <!-- <img v-if="state.data.photo" :src="user.photo" /> -->
            <ion-icon name="contact"></ion-icon>
          </ion-avatar>
          <p>
            <span>{{ state.data.pseudo }}</span>
            <br />
            <span>{{ state.data.email }}</span>
          </p>
        </ion-item>

        <ion-button expand="full" @click="wrappedLogout">Déconnexion</ion-button>
      </ion-list>
    </ion-content>

    <ion-footer>
      <div padding class="copyright">
        Version 2.0.0
        <br />Application créée par Bastien Wermeille
        <br />support@gestsis.ch
        <br />
        {{ new Date().getFullYear() }} © GestSIS, Tous droits réservés
      </div>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts" setup>
import useAuth from '@/store/useAuth';
import {
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonAvatar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const { state, logout } = useAuth();

const wrappedLogout = () => {
  logout();
  router.push({ name: 'login' })
}
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
