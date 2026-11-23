import { RECENT_ORDERS_KEY } from "./config";

const STORAGE_EVENT = "rm-storage-change";

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_ORDERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is number => typeof value === "number")
      : [];
  } catch {
    return [];
  }
}

export function getRecentOrders(): number[] {
  return readIds().slice(0, 8);
}

export function rememberOrder(id: number): void {
  if (typeof window === "undefined") return;
  const next = [id, ...readIds().filter((value) => value !== id)].slice(0, 100);
  window.localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function replaceStoredOrder(fromId: number, toId: number): void {
  if (typeof window === "undefined") return;
  const next = readIds().map((id) => (id === fromId ? toId : id));
  window.localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function forgetStoredOrder(id: number): void {
  if (typeof window === "undefined") return;
  const next = readIds().filter((value) => value !== id);
  window.localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function clearStoredOrders(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_ORDERS_KEY);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function subscribeToOrders(onChange: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => window.removeEventListener(STORAGE_EVENT, onChange);
}

export function getOrdersSnapshot(): string {
  return window.localStorage.getItem(RECENT_ORDERS_KEY) || "[]";
}

export function getServerOrdersSnapshot(): string {
  return "[]";
}
