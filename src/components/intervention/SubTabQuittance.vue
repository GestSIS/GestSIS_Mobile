<script lang="ts" setup>
import {
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  // modalController,
  IonBadge,
  IonLabel,
  IonButton,
} from "@ionic/vue";

import useActiveIntervention from "../../store/useActiveIntervention.ts";
import useSapeurs from "../../store/useSapeurs.ts";
import { computed } from "vue";
import router from "../../router/index.ts";
import useAuth from "../../store/useAuth.ts";

const { state } = useActiveIntervention();
// const { state, updatePresences } = useActiveIntervention();
const intervention = state;
intervention.value.sapeurs.sort((a, b) =>
  (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom),
);

const moduleSapeur = useSapeurs();
const sapeurs = moduleSapeur.state;

const sapeursSansPresence = computed(() => {
  const sapeursSaisi = new Set(intervention.value.sapeurs.map((s) => s.id));
  const sapeursIdPotentiel =
    intervention.value.alarme?.firefighters.map((f) => f.id) ?? [];
  const sapeursExistant = new Set(sapeurs.value.map((sap) => sap.id));
  return sapeursIdPotentiel?.filter(
    (s) => s && !sapeursSaisi.has(s) && sapeursExistant.has(s),
  );
});

const importerDepuisQuittance = () => {
  router.push({
    name: "sapeurs",
    params: { mode: "ARRIVEE" },
    query: {
      sapeursIds: sapeursSansPresence.value
        .map((id) => id.toString())
        .join(","),
    },
  });
};

const { activeSisKey } = useAuth();
const groupeAlarmes =
  intervention.value.alarme?.groups
    ?.filter((g) => g.sis === activeSisKey.value)
    ?.sort((g1, g2) => g1.number.localeCompare(g2.number)) ?? [];
</script>

<template>
  <ion-item v-if="!intervention.alarme"> Aucune quittance </ion-item>
  <ion-item>
    {{ sapeursSansPresence.length }} sapeur{{
      sapeursSansPresence.length > 1 ? "s" : ""
    }}
    importable depuis les quittances
    <ion-button
      slot="end"
      :disabled="!sapeursSansPresence.length"
      @click="importerDepuisQuittance"
    >
      Importer
    </ion-button>
  </ion-item>
  <ion-list v-if="intervention.alarme">
    <ion-item-group v-for="g in groupeAlarmes" :key="g.sis">
      <ion-item-divider>
        <ion-label>
          {{ g.sis.toUpperCase() }} : {{ g.number }} - {{ g.name }} </ion-label
        ><ion-badge slot="end">
          {{
            intervention.alarme.firefighters.filter(
              (f) => f.group_name == g.name,
            ).length +
            intervention.alarme.unresolved.filter((f) => f.group_name == g.name)
              .length
          }}
          quittances
        </ion-badge>
      </ion-item-divider>
      <ion-item
        v-for="s in intervention.alarme.firefighters.filter(
          (f) => f.group_name == g.name,
        )"
        :key="s.id"
      >
        {{ s.fullname }}
      </ion-item>
      <ion-item
        v-for="s in intervention.alarme.unresolved.filter(
          (f) => f.group_name == g.name,
        )"
        :key="s.fullname"
      >
        {{ s.fullname }}
      </ion-item>
    </ion-item-group>
  </ion-list>
</template>

<style></style>
