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
    >
      {{ vehicule.designation }}
      <ion-icon
        slot="end"
        :name="
          vehiculesIntervention.has(vehicule.id)
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
import { computed, ref } from 'vue';

const { state, updateVehicules } = useActiveIntervention();
const vehiculesIntervention = ref(new Set(state.value.vehicules.slice()));

const vehiculeStore = useVehicules();
const vehicules = computed(() => new Set(vehiculeStore.state.value));

const changeVehiculeStatut = (vehiculeId: number) => {
  if (vehiculesIntervention.value.has(vehiculeId)) {
    vehiculesIntervention.value.delete(vehiculeId);
  } else {
    vehiculesIntervention.value.add(vehiculeId);
  }
  updateVehicules([...vehiculesIntervention.value as any])
};

</script>