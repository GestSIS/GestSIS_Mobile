import useExcuseTypes from './useExcuseTypes';
import useExerciceCategories from './useExerciceCategories';
import useExexercices from './useExercices';
import useGroupes from './useGroupes';
import useHeureExerciceTypes from './useHeureExerciceTypes';
import useInterventions from './useInterventions';
import useLocalites from './useLocalites';
import useMateriels from './useMateriels';
import useMissionTypes from './useMissionTypes';
import usePhaseTypes from './usePhaseTypes';
import useSapeurs from './useSapeurs';
import useStatsFederal from './useStatsFederal';
import useTelephones from './useTelephones';
import useTypesIntervention from './useTypesIntervention';
import useUnitesType from './useUnitesTypes';
import useVehicules from './useVehicules';

export default function useStore() {
  const modules = [
    useExexercices,
    useInterventions,
    useSapeurs,
    useLocalites,
    useGroupes,
    useUnitesType,
    useExerciceCategories,
    useExcuseTypes,
    useHeureExerciceTypes,
    useMissionTypes,
    useTelephones,
    useStatsFederal,
    useTypesIntervention,
    useMateriels,
    useVehicules,
    usePhaseTypes,
  ];

  /** Persist all modules */
  const persist = () => {
    modules.forEach((useStoreModule) => {
      const { persist } = useStoreModule();
      persist();
    });
  };

  /** Reset all modules */
  const reset = () => {
    modules.forEach((useStoreModule) => {
      const { reset } = useStoreModule();
      reset();
    });
  };

  return {
    persist,
    reset,
  };
}
