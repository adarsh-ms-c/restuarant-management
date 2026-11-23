"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getOrdersSnapshot,
  getServerOrdersSnapshot,
  subscribeToOrders,
} from "./local";

export function useStoredOrderIds(): number[] {
  const raw = useSyncExternalStore(
    subscribeToOrders,
    getOrdersSnapshot,
    getServerOrdersSnapshot
  );
  return useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((value): value is number => typeof value === "number")
        : [];
    } catch {
      return [];
    }
  }, [raw]);
}
