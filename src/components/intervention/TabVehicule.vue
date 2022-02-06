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
      {{ vehicule.designation }}
      <ion-icon
        slot="end"
        :name="
          intervention.vehicules.has(vehicule.id)
            ? 'checkmark-circle'
            : 'radio-button-off'
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

const changeVehiculeStatut = (vehiculeId: number) => {
  if (intervention.vehicules.has(vehiculeId)) {
    intervention.vehicules.delete(vehiculeId);
  } else {
    intervention.vehicules.add(vehiculeId);
  }
};

</script>