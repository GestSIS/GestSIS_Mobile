export default function useBasicStore<Type>(
  state: { liste: Type[] },
  loader: () => Promise<Type[]>,
  persistKey: string
) {
  const persist = () => {
    //TODO: Persists by using persistKey
    const temp = persistKey;
  };
  const reset = () => {
    state.liste = [];
    persist();
  };
  const load = async () => {
    state.liste = await loader();
  };

  return {
    reset,
    persist,
    load,
  };
}
