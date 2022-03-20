import { Ref, ref } from 'vue';
import useBasicStore, { StoreState } from './useBasicStore';
import { Exercice } from '@/models/bundle';
import ExerciceService from '@/services/ExerciceService';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

const state: Ref<Exercice[]> = ref([]);
const store = useBasicStore(state, ExerciceService.getExercices, 'exercices');

export default function useExercices() {
  const name = 'Exercices';

  // Override load to prevent overriding existing exercices
  const sync = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;

    // Sync validated exercices
    const exercices: Exercice[] = state.value.filter(
      (e) => e.localStatus == 'validated'
    );
    await exercices.map(async (e) => {
      await ExerciceService.updateExercicePresences(e);
      return { ok: true, uuid: e.localUuid };
    });

    // Resolve conflicts to avoid overridinf in progress exercices
    const newExercices = (await ExerciceService.getExercices()).map(
      (e): Exercice => ({
        ...e,
        initialSapeurs: e.sapeurs,
        localUuid: uuidv4(),
        localStatus: 'empty',
      })
    );

    const inProgressExercices = exercices.filter(
      (e) => e.localStatus == 'in_progress'
    );
    const indexedInProgressExercices = inProgressExercices.reduce((acc, e) => {
      acc.set(e.id, e);
      return acc;
    }, new Map<number, Exercice>());

    // Resolve conflicting exercices
    const filteredExercices = newExercices.filter((e) => {
      const conflicting = indexedInProgressExercices.has(e.id);
      if (conflicting) {
        // TODO Resolve conflicts
        // Se baser sur le statut de l'exo ?
        // Non car pourrait déjà contenir des execuses
      }
      return !conflicting;
    });

    // Store loaded exercices
    state.value = [...inProgressExercices, ...filteredExercices];
    store.lastSync.value = DateTime.now().toSQL();
    store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  const updatExercice = (exercice: Exercice, reset = false) => {
    if (!reset) {
      exercice.localStatus =
        exercice.localStatus == 'validated' ? 'validated' : 'in_progress';
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

    // Actions
    updatExercice,
  };
}
