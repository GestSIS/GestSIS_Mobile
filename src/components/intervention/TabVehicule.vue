<template>
  <ion-grid>
    <ion-row>
      <ion-col>
        <h1>Véhicules</h1>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-list>
    <ion-item
      button="true"
      v-for="(vehicule, i) in vehicules"
      :key="i"
      @click="changeVehiculeStatut(vehicule.id)"
      :disabled="!intervention.en_creation"
    >
      {{ vehicule.nom }}
      <ion-icon
        slot="end"
        :name="
          intervention.vehicules.indexOf(vehicule.id) === -1
            ? 'radio-button-off'
            : 'checkmark-circle'
        "
      ></ion-icon>
    </ion-item>
  </ion-list>
</template>

<script lang="ts" setup>
import {
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonItem,
  IonIcon,
} from '@ionic/vue';
import useActiveIntervention from '@/store/useActiveIntervention';
import useVehicules from '@/store/useVehicules';

const { state } = useActiveIntervention();
const intervention = state;

const moduleVehicule = useVehicules();
const vehicules = moduleVehicule.state.liste;

const changeVehiculeStatut = (id: number) => {
  // TODO:
};

</script>