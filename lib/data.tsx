"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { listItems, listOrders } from "./api";
import {
  ITEMS_CACHE_KEY,
  ORDERS_CACHE_KEY,
  writeCache,
} from "./cache";
import { useCachedList } from "./useCachedList";
import type { Item, Order } from "./types";

type DataContextValue = {
  items: Item[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addLocalOrder: (order: Order) => void;
  resolveLocalOrder: (tempId: number, order: Order) => void;
  removeLocalOrder: (id: number) => void;
  patchLocalOrder: (id: number, patch: Partial<Order>) => void;
  addLocalItem: (item: Item) => void;
  resolveLocalItem: (tempId: number, item: Item) => void;
  removeLocalItem: (id: number) => void;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const cachedItems = useCachedList<Item>(ITEMS_CACHE_KEY).filter((item) => item.id > 0);
  const cachedOrders = useCachedList<Order>(ORDERS_CACHE_KEY).filter((order) => order.id > 0);
  const itemsRef = useRef<Item[]>([]);
  const ordersRef = useRef<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const commitItems = useCallback((next: Item[]) => {
    itemsRef.current = next;
    setItems(next);
    writeCache(ITEMS_CACHE_KEY, next);
    setLoaded(true);
  }, []);

  const commitOrders = useCallback((next: Order[]) => {
    ordersRef.current = next;
    setOrders(next);
    writeCache(ORDERS_CACHE_KEY, next);
    setLoaded(true);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemList, orderList] = await Promise.all([listItems(), listOrders()]);
      commitItems(itemList);
      commitOrders(orderList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [commitItems, commitOrders]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const addLocalOrder = useCallback(
    (order: Order) => {
      const base = ordersRef.current.length ? ordersRef.current : cachedOrders;
      commitOrders([order, ...base.filter((entry) => entry.id !== order.id)]);
    },
    [cachedOrders, commitOrders]
  );

  const resolveLocalOrder = useCallback(
    (tempId: number, order: Order) => {
      const base = ordersRef.current.length ? ordersRef.current : cachedOrders;
      commitOrders(base.map((entry) => (entry.id === tempId ? order : entry)));
    },
    [cachedOrders, commitOrders]
  );

  const removeLocalOrder = useCallback(
    (id: number) => {
      const base = ordersRef.current.length ? ordersRef.current : cachedOrders;
      commitOrders(base.filter((entry) => entry.id !== id));
    },
    [cachedOrders, commitOrders]
  );

  const patchLocalOrder = useCallback(
    (id: number, patch: Partial<Order>) => {
      const base = ordersRef.current.length ? ordersRef.current : cachedOrders;
      commitOrders(base.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
    },
    [cachedOrders, commitOrders]
  );

  const addLocalItem = useCallback(
    (item: Item) => {
      const base = itemsRef.current.length ? itemsRef.current : cachedItems;
      commitItems([...base, item]);
    },
    [cachedItems, commitItems]
  );

  const resolveLocalItem = useCallback(
    (tempId: number, item: Item) => {
      const base = itemsRef.current.length ? itemsRef.current : cachedItems;
      commitItems(base.map((entry) => (entry.id === tempId ? item : entry)));
    },
    [cachedItems, commitItems]
  );

  const removeLocalItem = useCallback(
    (id: number) => {
      const base = itemsRef.current.length ? itemsRef.current : cachedItems;
      commitItems(base.filter((entry) => entry.id !== id));
    },
    [cachedItems, commitItems]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      items: loaded ? items : cachedItems,
      orders: loaded ? orders : cachedOrders,
      loading,
      error,
      refresh,
      addLocalOrder,
      resolveLocalOrder,
      removeLocalOrder,
      patchLocalOrder,
      addLocalItem,
      resolveLocalItem,
      removeLocalItem,
    }),
    [
      loaded,
      items,
      orders,
      cachedItems,
      cachedOrders,
      loading,
      error,
      refresh,
      addLocalOrder,
      resolveLocalOrder,
      removeLocalOrder,
      patchLocalOrder,
      addLocalItem,
      resolveLocalItem,
      removeLocalItem,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
}
