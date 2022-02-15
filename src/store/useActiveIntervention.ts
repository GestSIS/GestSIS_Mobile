import { Ref, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import { Intervention } from '@/models/intervention';

import useInterventions from './useInterventions';
import { Mission } from '@/models/mission';
import { Appel } from '@/models/appel';

const state: Ref<Intervention> = ref({ ...new Intervention() });

export default function useActiveIntervention() {
  const reset = () => {
    state.value = new Intervention();
  };
  const setActiveIntervention = (intervention: Intervention) => {
    state.value = intervention;
  };
  const persist = () => {
    if (state.value != null){
      const { updateIntervention } = useInterventions();
      updateIntervention(state.value);
    }
  };

  const addMission = (mission: Mission) => {
    mission.localUuid = uuidv4();
    state.value.missions.push(mission);
    persist();
  }

  const updateMission = (mission: Mission) => {
    state.value.missions = [
      ...state.value.missions.filter(m => m.localUuid != mission.localUuid),
      mission
    ]
    persist();
  }

  const removeMission = (mission: Mission) => {
    state.value.missions = state.value.missions.filter(m => m.localUuid != mission.localUuid)
    persist();
  }

  const updateVehicules = (vehicules: number[]) => {
    state.value.vehicules = vehicules;
    console.log(vehicules)
    console.log(state.value)
    persist();
  }

  const updateMaterielQuantity = (materielId: number, quantity: number) => {
    state.value.materiel[materielId] = quantity;
    persist();
  }
  
  const removeMateriel = (materielId : number) => {
    delete state.value.materiel[materielId];
    persist();
  }

  const addAppel = (appel: Appel) => {
    appel.localUuid = uuidv4();
    state.value.appels.push(appel);
    persist();
  }

  const updateAppel = (appel: Appel) => {
    state.value.appels = state.value.appels.map(a => a.localUuid == appel.localUuid ? appel : a);
    persist();
  }

  const removeAppel = (appel: Appel) => {
    state.value.appels = state.value.appels.filter(a => a.localUuid != appel.localUuid);
    persist();
  }

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
  };
}
