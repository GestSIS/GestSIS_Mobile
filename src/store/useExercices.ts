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

  // TODO: Override load to prevent overriding existing exercices
  const load = async (): Promise<boolean> => {
    store.syncStatus.value = StoreState.Syncing;
    const newExercices = (await ExerciceService.getExercices()).map(e => ({...e, initialSapeurs: e.sapeurs, localUuid: uuidv4()}));

    // TODO: Do not lose data if reload exercices, Do not override edited exercices

    state.value = newExercices;
    store.lastSync.value = DateTime.now().toISO();
    store.persist();
    store.syncStatus.value = StoreState.Synced;
    return Promise.resolve(true);
  }

  const updatExercice = (exercice: Exercice) => {
    state.value = state.value.map(e => e.localUuid == exercice.localUuid ? exercice : e);
    store.persist();
  }

  return {
    ...store,
    load,
    name,
    state,

    // Actions
    updatExercice,
  };
}
