import { type Ref, ref } from "vue";
import { v4 as uuidv4 } from "uuid";

import { Intervention } from "../models/intervention.ts";

import useInterventions from "./useInterventions.ts";
import type { Mission } from "../models/mission.ts";
import type { Appel } from "../models/appel.ts";
import type { Jalon } from "../models/jalon.ts";

const state: Ref<Intervention> = ref({ ...new Intervention() });

export default function useActiveIntervention() {
  const reset = () => {
    state.value = new Intervention();
  };
  const setActiveIntervention = (intervention: Intervention) => {
    state.value = intervention;
  };
  const persist = () => {
    if (state.value != null) {
      const { updateIntervention } = useInterventions();
      updateIntervention(state.value);
    }
  };

  const addMission = (mission: Mission) => {
    mission.localUuid = uuidv4();
    state.value.missions.push(mission);
    persist();
  };

  const updateMission = (mission: Mission) => {
    state.value.missions = [
      ...state.value.missions.filter((m) => m.localUuid != mission.localUuid),
      mission,
    ];
    persist();
  };

  const removeMission = (mission: Mission) => {
    state.value.missions = state.value.missions.filter(
      (m) => m.localUuid != mission.localUuid,
    );
    persist();
  };

  const updateVehicules = (vehicules: number[]) => {
    state.value.vehicules = vehicules;
    persist();
  };

  const updateMaterielQuantity = (materielId: number, quantity: number) => {
    state.value.materiel[materielId] = quantity;
    persist();
  };

  const removeMateriel = (materielId: number) => {
    delete state.value.materiel[materielId];
    persist();
  };

  const addAppel = (appel: Appel) => {
    appel.localUuid = uuidv4();
    state.value.appels.push(appel);
    persist();
  };

  const updateAppel = (appel: Appel) => {
    state.value.appels = state.value.appels.map((a) =>
      a.localUuid == appel.localUuid ? appel : a,
    );
    persist();
  };

  const removeAppel = (appel: Appel) => {
    state.value.appels = state.value.appels.filter(
      (a) => a.localUuid != appel.localUuid,
    );
    persist();
  };

  const addJalon = (jalon: Jalon) => {
    jalon.localUuid = uuidv4();
    state.value.jalons.push(jalon);
    persist();
  };

  const updateJalon = (jalon: Jalon) => {
    state.value.jalons = state.value.jalons.map((j) =>
      j.localUuid == jalon.localUuid ? jalon : j,
    );
    persist();
  };

  const removeJalon = (jalon: Jalon) => {
    state.value.jalons = state.value.jalons.filter(
      (j) => j.localUuid != jalon.localUuid,
    );
    persist();
  };

  const updateGroupes = (groupes: number[]) => {
    state.value.groupes = groupes;
    persist();
  };

  const addSapeursArrival = (presences: {
    date: string;
    sapeurs: Array<{
      nom: string;
      prenom: string;
      id: number;
      selected: boolean;
    }>;
  }) => {
    const sapeursMapping = state.value.sapeurs.reduce((acc, s) => {
      acc.set(s.id, s);
      return acc;
    }, new Map<number, Intervention["sapeurs"][0]>());
    presences.sapeurs
      .filter((s) => s.selected)
      .forEach((s) => {
        let presence = sapeursMapping.get(s.id);
        // Get sapeur presence and either create a new entry or complete the existing one
        if (presence) {
          presence.presences.push({
            date_debut: presences.date,
            date_fin: "",
            piquet: false,
          });
        } else {
          presence = {
            id: s.id,
            nom: s.nom,
            prenom: s.prenom,
            presences: [
              {
                date_debut: presences.date,
                date_fin: "",
                piquet: false,
              },
            ],
          };
        }
        sapeursMapping.set(s.id, presence);
      });

    state.value.sapeurs = [...sapeursMapping.values()];
    persist();
  };

  const addSapeursDeparture = (presences: {
    date: string;
    sapeurs: Array<{
      nom: string;
      prenom: string;
      id: number;
      selected: boolean;
    }>;
  }) => {
    const sapeursMapping = state.value.sapeurs.reduce((acc, s) => {
      acc.set(s.id, s);
      return acc;
    }, new Map<number, Intervention["sapeurs"][0]>());
    presences.sapeurs
      .filter((s) => s.selected)
      .forEach((s) => {
        const presence = sapeursMapping.get(s.id);
        if (presence) {
          presence.presences = presence.presences.map((p) => ({
            ...p,
            date_fin: p.date_fin == "" ? presences.date : p.date_fin,
          }));
          sapeursMapping.set(s.id, presence);
        } else {
          console.error(
            "Hum seems like we are trying to remove a sapeur which is not there",
          );
        }
      });

    state.value.sapeurs = [...sapeursMapping.values()];
    persist();
  };

  const updatePresences = (sapeurs: Intervention["sapeurs"]) => {
    state.value.sapeurs = sapeurs;
    persist();
  };

  return {
    state,
    reset,
    setActiveIntervention,
    persist,

    // Actions
    addMission,
    updateMission,
    removeMission,
    updateVehicules,
    updateMaterielQuantity,
    removeMateriel,
    addAppel,
    updateAppel,
    removeAppel,
    addJalon,
    updateJalon,
    removeJalon,
    updateGroupes,

    // Sapeurs
    addSapeursArrival,
    addSapeursDeparture,
    updatePresences,
  };
}
