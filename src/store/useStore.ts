import useAuth from "./useAuth.ts";
import useExcuseTypes from "./useExcuseTypes.ts";
import useExerciceCategories from "./useExerciceCategories.ts";
import useExexercices from "./useExercices.ts";
import useGroupes from "./useGroupes.ts";
import useHeureExerciceTypes from "./useHeureExerciceTypes.ts";
import useInterventions from "./useInterventions.ts";
import useLocalites from "./useLocalites.ts";
import useLocalitesSis from "./useLocalitesSis.ts";
import useMaterielsIntervention from "./useMaterielsIntervention.ts";
import useMissionTypes from "./useMissionTypes.ts";
import usePhaseTypes from "./usePhaseTypes.ts";
import useSapeurs from "./useSapeurs.ts";
import useStatsFederal from "./useStatsFederal.ts";
import useTelephones from "./useTelephones.ts";
import useTypesIntervention from "./useTypesIntervention.ts";
import useUnitesType from "./useUnitesTypes.ts";
import useVehicules from "./useVehicules.ts";

import { modalController } from "@ionic/vue";
import ModalReconnectVue from "../components/modals/ModalReconnect.vue";
import { useNotify } from "../tools/useToast.ts";

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
    useMaterielsIntervention(),
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
    const modalReconnect = await modalController.create({
      component: ModalReconnectVue,
    });

    await modalReconnect.present();
  };

  /** Load all modules */
  const syncAll = async () => {
    const online = window.navigator.onLine;
    if (online) {
      const { hasPermission, isLoggedInExpired } = useAuth();

      if (isLoggedInExpired()) {
        showReconnectModal();
        return;
      }
      const promises = modules
        .filter((m) => !m.permission || hasPermission(m.permission))
        .map(({ sync }) => sync());
      try {
        const res = await Promise.all(promises);
        return res;
      } catch (e) {
        if (isLoggedInExpired()) {
          showReconnectModal();
        }
      }
    } else {
      const { error } = useNotify();
      error("Pas de connexion internet");
    }
  };

  const syncModule = async (module: { sync: () => Promise<any> }) => {
    const online = window.navigator.onLine;
    if (online) {
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
    } else {
      const { error } = useNotify();
      error("Pas de connexion internet");
    }
  };

  return {
    persist,
    reset,
    syncAll,
    syncModule,
    modules,
  };
}
