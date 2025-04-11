import { type Ref, ref } from "vue";
import useBasicStore, { StoreState } from "./useBasicStore";
import type { Exercice } from "../models/exercice";
import ExerciceService from "../services/ExerciceService";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import useAuth from "./useAuth";

const state: Ref<Exercice[]> = ref([]);
const store = useBasicStore(state, ExerciceService.getExercices, "exercices");

export default function useExercices() {
  const name = "Exercices";

  // Override load to prevent overriding existing exercices
  const sync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    // Exercice validé directly exported for sync
    // We assume that they are sure of their modifications
    const exercices: Exercice[] = state.value.filter(
      (e) => e.localStatus == "validated"
    );
    await exercices.map(async (e) => {
      await ExerciceService.updateExercicePresences(e);
      return { ok: true, uuid: e.localUuid };
    });

    // Resolve conflicts to avoid overriding in progress exercices
    const newExercices = (await ExerciceService.getExercices()).map(
      (e): Exercice => ({
        ...e,
        initialSapeurs: e.sapeurs,
        localUuid: uuidv4(),
        localStatus: "empty",
      })
    );

    const inProgressExercices = state.value.filter(
      (e) => e.localStatus == "in_progress"
    );
    const indexedInProgressExercices = inProgressExercices.reduce((acc, e) => {
      acc.set(e.id, e);
      return acc;
    }, new Map<number, Exercice>());

    // Check has validate permission
    const { hasPermission } = useAuth();
    const hasValidationPermission = hasPermission("exercice.validation");

    // TODO: Idée, dans une prochaine version afficher les exercices ne pouvant pas être saisie et les marquer en tant que tel
    const conflictResolvedExercices = newExercices
      .filter((e) => e.statut != 0) // Filter out canceled exercices
      .filter((e) => e.statut != 4) // Filter out imputed exercices
      .filter(
        (e) => (e.statut == 3 && !hasValidationPermission) || e.statut != 3
      ) // Filter out validated if no rights
      .map((e) => {
        const conflicting = indexedInProgressExercices.has(e.id);
        if (!conflicting) {
          return e;
        }
        const inProgressExercice = indexedInProgressExercices.get(e.id);

        // Set of ids for comparison
        const inProgressReferenceSapeursIds = new Set(
          inProgressExercice?.initialSapeurs.map((s) => s.sapeur_id)
        );
        const inProgressSapeursIds = new Set(
          inProgressExercice?.sapeurs.map((s) => s.sapeur_id)
        );
        const remoteSapeursIds = new Set(e?.sapeurs.map((s) => s.sapeur_id));

        const addedSapeurs = e.sapeurs.filter(
          (s) => !inProgressReferenceSapeursIds.has(s.sapeur_id)
        );
        // Si déjà rajouté, update présence avec nouvelles infos si pas saisie autrement ne rien faire
        const addedSapeursToKeep = addedSapeurs.map((s) => {
          if (!inProgressSapeursIds.has(s.sapeur_id)) {
            return s;
          }
          const sapeur = inProgressExercice?.sapeurs.find(
            (e) => e.sapeur_id == s.sapeur_id
          );
          if (
            sapeur?.absent ||
            sapeur?.excuse_type_id ||
            sapeur?.heures?.length ||
            sapeur?.remplace
          ) {
            // Sapeur local modifié
            return sapeur;
          }
          // Sapeur non saisi
          return s;
        });
        // Si pas ajouté, l'ajouter avec les infos saisies

        // Sapeurs modifiés
        const updatedSapeurs = inProgressExercice?.sapeurs.filter(
          (e) =>
            inProgressReferenceSapeursIds.has(e.sapeur_id) &&
            remoteSapeursIds.has(e.sapeur_id)
        );
        const updatedSapeursToKeep =
          updatedSapeurs?.map((s) => {
            // Modifié comparé à la référence ?
            const referenceSapeur = inProgressExercice?.initialSapeurs.find(
              (e) => e.sapeur_id == s.sapeur_id
            );
            // Si oui alors on récupère la version remote
            if (
              referenceSapeur?.absent != s.absent ||
              referenceSapeur?.excuse_type_id != s.excuse_type_id ||
              referenceSapeur?.remplace != s.remplace ||
              referenceSapeur?.present != s.present ||
              referenceSapeur?.heures.length != s.heures.length
            ) {
              // TODO: Heure comparaison could be improved
              return s;
            }

            // Si non, alors on garde la version locale
            const remoteSapeur =
              e.sapeurs?.find((e) => e.sapeur_id == s.sapeur_id) || null;
            return remoteSapeur ?? s;
          }) || [];

        // Sapeurs supprimés
        // Si sapeur saisie le garder autrement le supprimer
        const removedSapeurs = inProgressExercice?.sapeurs.filter(
          (s) => !remoteSapeursIds.has(s.sapeur_id)
        );
        const removedSapeursToKeep =
          removedSapeurs?.filter((s) => s.present || s.heures.length > 0) || [];

        e.initialSapeurs = e.sapeurs;
        e.localStatus == inProgressExercice?.localStatus;
        e.sapeurs = [
          ...addedSapeursToKeep,
          ...updatedSapeursToKeep,
          ...removedSapeursToKeep,
        ];
        return e;
        // Garder la saisie actuelle si saisie sinon récupérer les nouvelles modifs
      });

    // Store loaded exercices
    state.value = conflictResolvedExercices;
    store.lastSync.value = DateTime.now().toSQL() ?? "";
    store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  const updatExercice = (exercice: Exercice, reset = false) => {
    if (!reset) {
      exercice.localStatus =
        exercice.localStatus == "validated" ? "validated" : "in_progress";
    }
    state.value = state.value.map((e) =>
      e.localUuid == exercice.localUuid ? exercice : e
    );
    store.persist();
  };

  return {
    ...store,
    sync,
    name,
    state,
    permission: "exercice.presence",

    // Actions
    updatExercice,
  };
}
