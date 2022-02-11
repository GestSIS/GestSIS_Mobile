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
      :disabled="!state.en_creation"
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
import useInterventions from '@/store/useInterventions';

const { state, updateVehicules } = useActiveIntervention();

const moduleInter = useInterventions()
const vehiculesIntervention = ref(new Set(moduleInter.state.value[0].vehicules.slice()));

const moduleVehicule = useVehicules();
const vehicules = computed(() => new Set(moduleVehicule.state.value));

const changeVehiculeStatut = (vehiculeId: number) => {
  if (vehiculesIntervention.value.has(vehiculeId)) {
    vehiculesIntervention.value.delete(vehiculeId);
  } else {
    vehiculesIntervention.value.add(vehiculeId);
  }
  updateVehicules([...vehiculesIntervention.value as any])
};

</script>