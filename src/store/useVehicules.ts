import { readonly, Ref, ref } from 'vue';
import useBasicStore from './useBasicStore';
import { Vehicule } from '../models/bundle';
import VehiculeService from '@/services/VehiculeService';

const state: Ref<Vehicule[]> = ref([]);
const store = useBasicStore(
  state,
  VehiculeService.getVehicules,
  'vehicules'
);

export default function useVehicules() {
  const name = "Véhicules";

  return {
    ...store,
    name,
    state: readonly(state),
    permission: 'intervention.modification',
  };
}
