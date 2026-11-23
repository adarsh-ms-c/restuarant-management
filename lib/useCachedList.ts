"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getCacheSnapshot,
  getServerCacheSnapshot,
  parseCache,
  subscribeToCache,
} from "./cache";

export function useCachedList<T>(key: string): T[] {
  const raw = useSyncExternalStore(
    subscribeToCache,
    () => getCacheSnapshot(key),
    getServerCacheSnapshot
  );
  return useMemo(() => parseCache<T>(raw), [raw]);
}
