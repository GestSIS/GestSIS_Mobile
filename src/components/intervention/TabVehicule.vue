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
      v-for="(vehicule, i) in vehicules"
      :key="i"
      :button="true"
      :disabled="intervention.localStatus == 'validated'"
      @click="changeVehiculeStatut(vehicule.id)"
    >
      {{ vehicule.designation }}
      <ion-icon
        slot="end"
        :icon="
          vehiculesIntervention.has(vehicule.id)
            ? checkmarkCircle
            : radioButtonOff
        "
        :aria-label="
          vehiculesIntervention.has(vehicule.id) ? 'engagé' : 'non engagé'
        "
      />
    </ion-item>
  </ion-list>
</template>

<script lang="ts" setup>
import { IonList, IonGrid, IonCol, IonRow, IonItem, IonIcon } from "@ionic/vue";
import { checkmarkCircle, radioButtonOff } from "ionicons/icons";
import useActiveIntervention from "../../store/useActiveIntervention";
import useVehicules from "../../store/useVehicules";
import { computed, ref } from "vue";

const { state, updateVehicules } = useActiveIntervention();
const intervention = state;
const vehiculesIntervention = ref(new Set(state.value.vehicules.slice()));

const vehiculeStore = useVehicules();
const vehicules = computed(() => new Set(vehiculeStore.state.value));

const changeVehiculeStatut = (vehiculeId: number) => {
  if (vehiculesIntervention.value.has(vehiculeId)) {
    vehiculesIntervention.value.delete(vehiculeId);
  } else {
    vehiculesIntervention.value.add(vehiculeId);
  }
  updateVehicules([...vehiculesIntervention.value]);
};
</script>
