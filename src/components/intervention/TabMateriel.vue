<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Matériel</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button
          expand="block"
          slot="start"
          @click="addMateriel()"
          :disabled="!intervention.en_creation"
        >
          <ion-icon name="add" item-start></ion-icon>Ajouter
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-list>
    <ion-item
      v-for="(materiel, i) in intervention.materiel"
      :key="i"
      @click="changeMaterielQuantity(materiel, i)"
    >
      <strong item-start>{{ materiel.quantite }}</strong>
      {{ materiel.nom }}
      <button
        ion-button
        icon-only
        item-end
        @click="removeMateriel(i, $event)"
        clear
        color="dark"
      >
        <ion-icon name="close"></ion-icon>
      </button>
    </ion-item>
  </ion-list>
</template>

<script lang="ts" setup>
import useActiveIntervention from '@/store/useActiveIntervention';

const { state } = useActiveIntervention();
const intervention = state;


const addMateriel = () => {
  // TODO:
};
const changeMaterielQuantity = (materiel: any, i: any) => {
  // TODO:
};
const removeMateriel = (i: any, event: any) => {
  // TODO:
};

</script>