<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>

      <ion-title>Ajouter un sapeur</ion-title>

      <ion-buttons right>
        <ion-button @click="validate()" v-if="props.multiSelect">Valider</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    <ion-searchbar @ionInput="search($event)" placeholder="Rechercher..." ref="searchbar"></ion-searchbar>

    <ion-list>
      <ion-item
        v-for="sapeur of filteredSapeur"
        :key="sapeur.id"
        @click="selectSapeur(sapeur)"
      >{{ sapeur.nom }} {{ sapeur.prenom }}</ion-item>
    </ion-list>
  </ion-content>
</template>


<script lang="ts" setup>
import { defineProps, computed, PropType, ref } from "vue";
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
  modalController,
} from '@ionic/vue';
import useSapeurs from "@/store/useSapeurs";
import { Sapeur } from "@/models/sapeur";

const props = defineProps({
  exceptSapeurIds: { type: Array as PropType<Array<number>>, required: false, default: () => [] },
  multiSelect: { type: Boolean, required: false, default: false }
});

const exceptIds = new Set(props.exceptSapeurIds);

const query = ref("")
const sapeurModule = useSapeurs();
const filteredSapeur = computed(() => {
  return sapeurModule.state.value
    .filter(s => !exceptIds.has(s.id))
    .filter(s => (s.nom + "" + s.prenom)
      .toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .indexOf(query.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")) > -1)
    .sort((a, b) => (a.nom + " " + a.prenom).localeCompare((b.nom + " " + b.prenom)))
})

const search = (event: any) => {
  query.value = event.target.value.toLowerCase();
}

const dismiss = () => {
  modalController.dismiss(null);
}

const validate = () => {
  // TODO:
}

const selectSapeur = (sapeur: Sapeur) => {
  if (!props.multiSelect) {
    modalController.dismiss(sapeur.id);
  }
}

// const searchbar = ref<ComponentPublicInstance<HTMLInputElement>>();
// onMounted(() => {
//   searchbar.value?.$el.setFocus();
// })
</script>

<style>
</style>