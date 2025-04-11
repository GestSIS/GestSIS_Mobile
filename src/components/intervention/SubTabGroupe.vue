<script lang="ts" setup>
import { IonList, IonItem, IonIcon } from "@ionic/vue";

import { checkmarkCircle, radioButtonOff } from "ionicons/icons";

import useActiveIntervention from "../../store/useActiveIntervention";
import useGroupes from "../../store/useGroupes";
import { ref, computed } from "vue";

const { state, updateGroupes } = useActiveIntervention();
const intervention = state;
intervention.value.sapeurs.sort((a, b) =>
  (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom)
);

const moduleGroupe = useGroupes();
const groupes = moduleGroupe.state;

const filteredGroupes = computed(() =>
  groupes.value
    .filter((g) => g.type == 1)
    .sort((a, b) => parseInt(`${a.no || 99}`) - parseInt(`${b.no || 99}`))
);
const groupesIntervention = ref(new Set(intervention.value.groupes));

const changeGroupeStatus = (groupeId: number) => {
  if (groupesIntervention.value.has(groupeId)) {
    groupesIntervention.value.delete(groupeId);
  } else {
    groupesIntervention.value.add(groupeId);
  }
  updateGroupes([...groupesIntervention.value]);
};
</script>

<template>
  <ion-list>
    <ion-item
      v-for="(groupe, i) of filteredGroupes"
      :key="i"
      button
      :disabled="intervention.localStatus == 'validated'"
      @click="changeGroupeStatus(groupe.id)"
    >
      {{ (groupe.no ? groupe.no + " - " : "") + groupe.designation }}
      <ion-icon
        slot="end"
        :icon="
          groupesIntervention.has(groupe.id) ? checkmarkCircle : radioButtonOff
        "
        aria-hidden="true"
      />
    </ion-item>
  </ion-list>
</template>

<style></style>
