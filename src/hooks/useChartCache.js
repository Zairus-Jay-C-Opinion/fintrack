import { useSyncExternalStore } from "react";
import { getChartCache, subscribeChartCache } from "../utils/chartCache";

export function useChartCache() {
  return useSyncExternalStore(
    subscribeChartCache,
    getChartCache,
    getChartCache
  );
}
