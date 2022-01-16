import { reactive, readonly } from 'vue';
import useBasicStore from './useBasicStore';
import { Vehicule } from '@/models/bundle';
import VehiculeService from '@/services/VehiculeService';

export interface State {
  liste: Vehicule[];
}
const state: State = reactive({ liste: [] });

export default function useVehicules() {
  const name = "Véhicules";
  const store = useBasicStore(
    state,
    VehiculeService.getVehicules,
    'vehicules'
  );

  return {
    ...store,  
    name,
    state: readonly(state),
  };
}
