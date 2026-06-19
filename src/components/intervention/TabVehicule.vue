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
      v-for="vehicule in vehicules"
      :key="vehicule.id"
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
import useActiveIntervention from "../../store/useActiveIntervention.ts";
import useVehicules from "../../store/useVehicules.ts";
import { computed } from "vue";

const { state, updateVehicules } = useActiveIntervention();
const intervention = state;
// Derive selection from the store so it always reflects the active
// intervention (instead of a one-time snapshot taken at setup).
const vehiculesIntervention = computed(() => new Set(state.value.vehicules));

const vehiculeStore = useVehicules();
const vehicules = computed(() => vehiculeStore.state.value);

const changeVehiculeStatut = (vehiculeId: number) => {
  const next = new Set(state.value.vehicules);
  if (next.has(vehiculeId)) {
    next.delete(vehiculeId);
  } else {
    next.add(vehiculeId);
  }
  updateVehicules([...next]);
};
</script>
