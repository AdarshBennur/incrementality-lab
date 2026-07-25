import { useSyncExternalStore } from "react";
import { EXPERIMENTS } from "./experiment-data";

let experimentId = EXPERIMENTS[0].id;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => experimentId;

export function useExperimentStore() {
  const id = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    experimentId: id,
    setExperimentId: (next: string) => {
      experimentId = next;
      listeners.forEach((l) => l());
    },
  };
}

export function useCurrentExperiment() {
  const { experimentId } = useExperimentStore();
  return EXPERIMENTS.find((e) => e.id === experimentId) ?? EXPERIMENTS[0];
}
