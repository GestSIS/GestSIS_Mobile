<script lang="ts" setup>
import {
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  // modalController,
  IonBadge,
  IonLabel,
} from "@ionic/vue";

import useActiveIntervention from "@/store/useActiveIntervention";
// import useSapeurs from "@/store/useSapeurs";
// import { computed } from "vue";
// import router from "@/router";
// import ModalSapeurPresenceVue from "../modals/ModalSapeurPresence.vue";
import useAuth from "@/store/useAuth";

// const { state, updatePresences } = useActiveIntervention();
const { state } = useActiveIntervention();
const intervention = state;
intervention.value.sapeurs.sort((a, b) =>
  (a.nom + " " + a.prenom).localeCompare(b.nom + " " + b.prenom)
);

// const moduleSapeur = useSapeurs();
// const sapeurs = moduleSapeur.state;

// const sapeursSansPresenceExercices = computed(() => {
//   const sapeursSaisi = [
//     ...new Map(
//       intervention.value.missions
//         .filter((mission) => mission.sapeur.id)
//         .map((mission) => mission.sapeur)
//         .map((s) => [s.id, { ...s, type: 0 }])
//     ).values(),
//   ];
//   const sapeursIdPotentiel = new Set(
//     intervention.value.sapeurs.map((sap) => sap.id)
//   );
//   const sapeursExistant = new Set(sapeurs.value.map((sap) => sap.id));
//   return sapeursSaisi.filter(
//     (s) => s.id && !sapeursIdPotentiel.has(s.id) && sapeursExistant.has(s.id)
//   );
// });

// const addMissingSapeur = (sapeurId: number) => {
//   router.push({
//     name: "sapeurs",
//     params: { mode: "ARRIVEE" },
//     query: { sapeursIds: sapeurId.toString() },
//   });
// };

// const addPresenceExercice = (mode: "ARRIVEE" | "DEPART") => {
//   router.push({ name: "sapeurs", params: { mode } });
// };
// const editPresenceExercice = async (
//   sapeurIndex: number,
//   presenceIndex: any
// ) => {
//   const sapeur = intervention.value.sapeurs[sapeurIndex];
//   if (!sapeur) {
//     return;
//   }

//   const presence = {
//     ...sapeur.presences[presenceIndex],
//     sapeur_id: sapeur.id,
//     nom: sapeur.nom,
//     prenom: sapeur.prenom,
//   };
//   const modalEditPresence = await modalController.create({
//     component: ModalSapeurPresenceVue,
//     componentProps: presence,
//   });

//   await modalEditPresence.present();
//   const { data } = await modalEditPresence.onDidDismiss();
//   if (data) {
//     sapeur.presences[presenceIndex] = {
//       date_debut: data.date_debut,
//       date_fin: data.date_fin,
//       piquet: false,
//     };
//   }

//   // Update data in store
//   updatePresences(intervention.value.sapeurs);
// };

const { activeSisKey } = useAuth();
const groupeAlarmes =
  intervention.value.alarme?.groups
    ?.filter((g) => g.sis === activeSisKey.value)
    ?.sort((g1, g2) => g1.number.localeCompare(g2.number)) ?? [];
</script>

<template>
  <ion-item v-if="!intervention.alarme">Aucune quittance</ion-item>
  <ion-list v-if="intervention.alarme">
    <ion-item-group v-for="g in groupeAlarmes" :key="g.sis">
      <ion-item-divider>
        <ion-label
          >{{ g.sis.toUpperCase() }} : {{ g.number }} - {{ g.name }}</ion-label
        ><ion-badge slot="end"
          >{{
            intervention.alarme.firefighters.filter(
              (f) => f.group_name == g.name
            ).length +
            intervention.alarme.unresolved.filter((f) => f.group_name == g.name)
              .length
          }}
          quittances</ion-badge
        >
      </ion-item-divider>
      <ion-item
        v-for="s in intervention.alarme.firefighters.filter(
          (f) => f.group_name == g.name
        )"
        :key="s.id"
      >
        {{ s.fullname }}
      </ion-item>
      <ion-item
        v-for="s in intervention.alarme.unresolved.filter(
          (f) => f.group_name == g.name
        )"
        :key="s.fullname"
      >
        {{ s.fullname }}
      </ion-item>
    </ion-item-group>
  </ion-list>
</template>

<style scoped>
.details {
  color: var(--ion-color-medium);
}
</style>
