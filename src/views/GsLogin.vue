<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="login">
        <ion-list>
          <ion-item>
            <ion-input
              type="email"
              v-model="account.username"
              name="email"
              placeholder="Adresse e-mail"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="password"
              v-model="account.password"
              name="password"
              placeholder="Mot de passe"
            ></ion-input>
          </ion-item>
          <ion-item>
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
          </ion-item>
          <ion-button
            type="submit"
            color="primary"
            expand="block"
            class="ion-margin-top"
          >
            Connexion
          </ion-button>
        </ion-list>
      </form>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonPage,
  IonTitle,
  IonItem,
  IonInput,
  IonList,
  IonLabel,
  IonHeader,
  IonSelectOption,
  IonSelect,
  IonToolbar,
  IonButton,
} from "@ionic/vue";

export default {
  name: "GsInterventions",
  components: {
    IonContent,
    IonPage,
    IonTitle,
    IonItem,
    IonInput,
    IonList,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonSelectOption,
    IonSelect,
    IonButton,
  },
  data() {
    return {
      title: "Connexion",
      account: {
        password: "",
        username: "",
        sisId: null,
      },
      listeSis: [
        {
          id: 1,
          nom: "Haute-Sorne",
        },
        {
          id: 2,
          nom: "Val-Terbi",
        },
        {
          id: 3,
          nom: "Test",
        },
      ],
    };
  },
  methods: {
    login() {
      console.log("login");
    },
  },
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