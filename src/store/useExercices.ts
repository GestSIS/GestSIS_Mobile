import { type Ref, ref } from "vue";
import useBasicStore, { StoreState } from "./useBasicStore.ts";
import type { Exercice } from "../models/exercice.ts";
import type { PresenceExercice } from "../models/presence-exercice.ts";
import ExerciceService from "../services/ExerciceService.ts";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import useAuth from "./useAuth.ts";

const state: Ref<Exercice[]> = ref([]);
const store = useBasicStore(state, ExerciceService.getExercices, "exercices");

// Un sapeur est considéré "saisi" dès qu'une présence a été renseignée
// (présent / absent / remplacé / excusé / heures). Sert à ne pas écraser une
// saisie locale lors de la résolution de conflits.
const isPresenceSaisie = (s: PresenceExercice): boolean =>
  Boolean(s.present || s.absent || s.remplace || s.excuse_type_id) ||
  (s.heures?.length ?? 0) > 0;

// Compare deux listes d'heures par type + quantité (quantité normalisée en
// nombre car l'API peut la renvoyer en chaîne). true = elles diffèrent.
const heuresDiffer = (
  a: PresenceExercice["heures"] | undefined,
  b: PresenceExercice["heures"] | undefined,
): boolean => {
  const listA = a ?? [];
  const listB = b ?? [];
  if (listA.length !== listB.length) return true;
  const byType = new Map(
    listA.map((h) => [h.heure_exercice_type_id, Number(h.quantite)]),
  );
  return listB.some(
    (h) => byType.get(h.heure_exercice_type_id) !== Number(h.quantite),
  );
};

export default function useExercices() {
  const name = "Exercices";

  // Override load to prevent overriding existing exercices
  const sync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    try {
      return await doSync();
    } catch (e) {
      // Never leave the store stuck on "Syncing" when the export/fetch throws.
      store.syncStatus.value = StoreState.NeedSync;
      throw e;
    }
  };

  const doSync = async (): Promise<boolean> => {
    // Wait for cached exercices to finish loading before reading state, so a
    // sync triggered before init() resolves cannot drop in-progress edits.
    await store.ready;

    // Exercice validé directly exported for sync
    // We assume that they are sure of their modifications
    const exercices: Exercice[] = state.value.filter(
      (e) => e.localStatus == "validated",
    );
    await Promise.all(
      exercices.map(async (e) => {
        await ExerciceService.updateExercicePresences(e);
        return { ok: true, uuid: e.localUuid };
      }),
    );

    // Resolve conflicts to avoid overriding in progress exercices
    const newExercices = (await ExerciceService.getExercices()).map(
      (e): Exercice => ({
        ...e,
        initialSapeurs: e.sapeurs,
        localUuid: uuidv4(),
        localStatus: "empty",
      }),
    );

    const inProgressExercices = state.value.filter(
      (e) => e.localStatus == "in_progress",
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
      // Filter out validated (statut 3) exercices for users without validation rights
      .filter((e) => e.statut != 3 || hasValidationPermission)
      .map((e) => {
        const conflicting = indexedInProgressExercices.has(e.id);
        if (!conflicting) {
          return e;
        }
        const inProgressExercice = indexedInProgressExercices.get(e.id);

        // Set of ids for comparison
        const inProgressReferenceSapeursIds = new Set(
          inProgressExercice?.initialSapeurs.map((s) => s.sapeur_id),
        );
        const inProgressSapeursIds = new Set(
          inProgressExercice?.sapeurs.map((s) => s.sapeur_id),
        );
        const remoteSapeursIds = new Set(e?.sapeurs.map((s) => s.sapeur_id));

        const addedSapeurs = e.sapeurs.filter(
          (s) => !inProgressReferenceSapeursIds.has(s.sapeur_id),
        );
        // Si déjà rajouté, update présence avec nouvelles infos si pas saisie autrement ne rien faire
        const addedSapeursToKeep = addedSapeurs.map((s) => {
          if (!inProgressSapeursIds.has(s.sapeur_id)) {
            return s;
          }
          const sapeur = inProgressExercice?.sapeurs.find(
            (e) => e.sapeur_id == s.sapeur_id,
          );
          if (sapeur && isPresenceSaisie(sapeur)) {
            // Sapeur local modifié (présent inclus)
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
            remoteSapeursIds.has(e.sapeur_id),
        );
        const updatedSapeursToKeep =
          updatedSapeurs?.map((s) => {
            // Modifié comparé à la référence ?
            const referenceSapeur = inProgressExercice?.initialSapeurs.find(
              (e) => e.sapeur_id == s.sapeur_id,
            );
            // Si oui alors on récupère la version remote
            if (
              referenceSapeur?.absent != s.absent ||
              referenceSapeur?.excuse_type_id != s.excuse_type_id ||
              referenceSapeur?.remplace != s.remplace ||
              referenceSapeur?.present != s.present ||
              heuresDiffer(referenceSapeur?.heures, s.heures)
            ) {
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
          (s) => !remoteSapeursIds.has(s.sapeur_id),
        );
        const removedSapeursToKeep =
          removedSapeurs?.filter((s) => isPresenceSaisie(s)) || [];

        e.initialSapeurs = e.sapeurs;
        e.localStatus = inProgressExercice?.localStatus ?? "empty";
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
      e.localUuid == exercice.localUuid ? exercice : e,
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
