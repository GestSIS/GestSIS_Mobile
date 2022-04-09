import useAuth from './useAuth';
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
    useExexercices(),
    useInterventions(),
    useSapeurs(),
    useLocalites(),
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

  /** Load all modules */
  const syncAll = () => {
    const { activePermissions } = useAuth();
    const promises = modules
      .filter(m => !m.permission || activePermissions.value.includes(m.permission))
      .map(({ sync }) => sync());
    return Promise.all(promises);
  };

  return {
    persist,
    reset,
    syncAll,
    modules,
  };
}
