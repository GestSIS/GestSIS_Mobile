import useAuth from "./useAuth.ts";
import useExcuseTypes from "./useExcuseTypes.ts";
import useExerciceCategories from "./useExerciceCategories.ts";
import useExexercices from "./useExercices.ts";
import useGroupes from "./useGroupes.ts";
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

// Un seul modal de reconnexion à la fois : plusieurs synchronisations peuvent
// constater l'expiration en même temps (ou l'utilisateur relancer la synchro),
// et des modals empilés partageraient la même vérification 2FA en cours.
let reconnectModalOpen = false;

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
    if (reconnectModalOpen) {
      return;
    }
    reconnectModalOpen = true;
    try {
      const modalReconnect = await modalController.create({
        component: ModalReconnectVue,
      });
      modalReconnect.onDidDismiss().then(() => {
        reconnectModalOpen = false;
      });
      await modalReconnect.present();
    } catch (error) {
      reconnectModalOpen = false;
      throw error;
    }
  };

  /** Load all modules */
  const syncAll = async () => {
    const online = window.navigator.onLine;
    if (!online) {
      const { error } = useNotify();
      error("Pas de connexion internet");
      return;
    }

    const { hasPermission, isLoggedInExpired } = useAuth();

    if (isLoggedInExpired()) {
      showReconnectModal();
      return;
    }

    // allSettled (not all): one failing module must not abort the others,
    // which would otherwise hide successful syncs and give no feedback.
    const results = await Promise.allSettled(
      modules.filter((m) => !m.permission || hasPermission(m.permission)).map(({ sync }) => sync()),
    );

    // A refresh-token expiry can surface mid-sync.
    if (isLoggedInExpired()) {
      showReconnectModal();
      return results;
    }

    const failures = results.filter((r) => r.status === "rejected").length;
    if (failures > 0) {
      const { error } = useNotify();
      error(`La synchronisation de ${failures} élément(s) a échoué, veuillez réessayer.`);
    }

    return results;
  };

  /**
   * Synchronise un module. Renvoie true si la synchronisation a réussi : hors ligne, session
   * expirée (la modale de reconnexion s'ouvre) ou erreur, l'appelant reste sur sa page.
   */
  const syncModule = async (module: { sync: () => Promise<unknown> }): Promise<boolean> => {
    const { error } = useNotify();
    if (!window.navigator.onLine) {
      error("Pas de connexion internet");
      return false;
    }

    const { isLoggedInExpired } = useAuth();
    if (isLoggedInExpired()) {
      void showReconnectModal();
      return false;
    }

    try {
      await module.sync();
      return true;
    } catch {
      // Un refresh token expiré peut apparaître pendant la synchronisation.
      if (isLoggedInExpired()) {
        void showReconnectModal();
      } else {
        error("La synchronisation a échoué, veuillez réessayer.");
      }
      return false;
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
