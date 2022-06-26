<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  IonIcon,
  modalController,
} from '@ionic/vue';
import useTelephones from "@/store/useTelephones";
import { alertController } from "@ionic/core";
import { useNotify } from "@/tools/useToast";


const notify = useNotify();

const query = ref("")
const telephoneModule = useTelephones();
const filteredTelephone = computed(() => {
  return telephoneModule.state.value.filter(m => (m.nom + " " + m.numero)
    .toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .indexOf(query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")) > -1)
})

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
}

const isPhoneNumber = (str: string): boolean => {
  return /^(?=.*\d)[\d ]+$/.test(str);
}

const dismiss = () => {
  modalController.dismiss(null);
}
const selectTelephone = (telephone: any) => {
  modalController.dismiss(telephone);
}

const addTelephone = async () => {
  const promptTelephone = await alertController.create({
    header: 'Nouveau numéro',
    message: "Nom et numéro de la personne ou de l'entreprise appelée :",
    inputs: [
      {
        name: 'nom',
        placeholder: 'Nom',
        type: 'text',
      }, {
        name: 'numero',
        placeholder: 'Numéro',
        type: 'text',
      },
    ],
    buttons: [
      {
        text: 'Annuler',
        handler: values => ({ values, canceled: true })
      },
      {
        text: 'Valider',
        handler: values => {
          if (values.nom == '' || values.numero == '') {
            notify.error('Veuillez remplir tous les champs');
            return false;
          }
          else if (!isPhoneNumber(values.numero)) {
            notify.error('N° de téléphone invalide');
            return false;
          } else {
            selectTelephone({
              nom: values.nom,
              numero: values.numero,
              nouveau_numero: true
            })
          }
        }
      }
    ]
  });
  await promptTelephone.present();
}

</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Nouvel appel</ion-title>

      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-searchbar @ionInput="search($event)" placeholder="Rechercher..."></ion-searchbar>

    <ion-list>
      <ion-item @click="addTelephone">
        <ion-icon name="add" slot="start"></ion-icon>Entrer un nouveau numéro
      </ion-item>
      <ion-item
        v-for="telephone of filteredTelephone"
        :key="telephone.id"
        @click="selectTelephone(telephone)"
      >
        <ion-icon name="call" slot="start"></ion-icon>
        {{ telephone.nom }}
        <span slot="end">{{ telephone.numero }}</span>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style>
</style>
