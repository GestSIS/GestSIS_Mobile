import useAuth from './useAuth';
import useExcuseTypes from './useExcuseTypes';
import useExerciceCategories from './useExerciceCategories';
import useExexercices from './useExercices';
import useGroupes from './useGroupes';
import useHeureExerciceTypes from './useHeureExerciceTypes';
import useInterventions from './useInterventions';
import useLocalites from './useLocalites';
import useLocalitesSis from './useLocalitesSis';
import useMateriels from './useMateriels';
import useMissionTypes from './useMissionTypes';
import usePhaseTypes from './usePhaseTypes';
import useSapeurs from './useSapeurs';
import useStatsFederal from './useStatsFederal';
import useTelephones from './useTelephones';
import useTypesIntervention from './useTypesIntervention';
import useUnitesType from './useUnitesTypes';
import useVehicules from './useVehicules';

import { modalController } from '@ionic/vue';
import ModalReconnectVue from '../components/modals/ModalReconnect.vue';

export default function useStore() {
  const modules = [
    useExexercices(),
    useInterventions(),
    useSapeurs(),
    useLocalites(),
    useLocalitesSis(),
    useGroupes(),
    useUnitesType(),
    useExerciceCategories(),
    useExcuseTypes(),
    useHeureExerciceTypes(),
    useMissionTypes(),
    useTelephones(),
    useStatsFederal(),
    useTypesIntervention(),
    useMateriels(),
    useVehicules(),
    usePhaseTypes(),
  ];

  /** Persist all modules */
  const persist = () => {
    modules.forEach(({ persist }) => persist());
  };

  /** Reset all modules */
  const reset = () => {
    modules.forEach(({ reset }) => reset());
  };

  const showReconnectModal = async () => {
    const modalReconnect = await modalController
      .create({
        component: ModalReconnectVue,
      })

    await modalReconnect.present();
  }

  /** Load all modules */
  const syncAll = async () => {
    const { hasPermission, isLoggedInExpired } = useAuth();

    if (isLoggedInExpired()) {
      showReconnectModal();
      return;
    }
    const promises = modules
      .filter(m => !m.permission || hasPermission(m.permission))
      .map(({ sync }) => sync());
    try {
      const res = await Promise.all(promises);
      return res;
    } catch (e) {
      if (isLoggedInExpired()) {
        showReconnectModal();
      }
    }
  };

  const syncModule = async (module: { sync: () => Promise<any> }) => {
    const { isLoggedInExpired } = useAuth();

    if (isLoggedInExpired()) {
      showReconnectModal();
      return;
    }
    try {
      const res = await module.sync();
      return res;
    } catch (e) {
      if (isLoggedInExpired()) {
        showReconnectModal();
      }
    }
  }

  return {
    persist,
    reset,
    syncAll,
    syncModule,
    modules,
  };
}
