export const ITEMS_CACHE_KEY = "rm_items_cache";
export const ORDERS_CACHE_KEY = "rm_orders_cache";

const CACHE_EVENT = "rm-cache-change";

type Cached<T> = { savedAt: number; data: T[] };

export function writeCache<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  const payload: Cached<T> = { savedAt: Date.now(), data };
  window.localStorage.setItem(key, JSON.stringify(payload));
  window.dispatchEvent(new Event(CACHE_EVENT));
}

export function parseCache<T>(raw: string): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<Cached<T>>;
    if (!Array.isArray(parsed.data)) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

export function subscribeToCache(onChange: () => void): () => void {
  window.addEventListener(CACHE_EVENT, onChange);
  return () => window.removeEventListener(CACHE_EVENT, onChange);
}

export function getCacheSnapshot(key: string): string {
  return window.localStorage.getItem(key) || "";
}

export function getServerCacheSnapshot(): string {
  return "";
}
