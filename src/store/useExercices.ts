import { readonly, Ref, ref } from 'vue';
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
    const res = await exercices.map(async (e) => {
      await ExerciceService.updateExercicePresences(e)
      return { ok: true, uuid: e.localUuid };
    });

    // TODO: Do not lose data if reload exercices, Do not override edited exercices
    
    const newExercices = (await ExerciceService.getExercices()).map(
      (e): Exercice => ({
        ...e,
        initialSapeurs: e.sapeurs,
        localUuid: uuidv4(),
        localStatus: 'empty',
      })
    );

    // Store loaded exercices
    state.value = newExercices;
    store.lastSync.value = DateTime.now().toSQL();
    store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  };

  const updatExercice = (exercice: Exercice, reset = false) => {
    if (!reset){
      exercice.localStatus = exercice.localStatus == "validated" ? "validated" : "in_progress";
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
