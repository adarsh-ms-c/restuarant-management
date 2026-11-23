import { API_URL } from "./config";
import type { AddItemInput, ApiResponse, Item, Order } from "./types";

function requireUrl() {
  if (!API_URL) {
    throw new Error("Apps Script URL is missing. Set NEXT_PUBLIC_APPS_SCRIPT_URL in .env.local.");
  }
}

async function readPayload(response: Response): Promise<ApiResponse<unknown>> {
  const text = await response.text();
  let payload: ApiResponse<unknown>;
  try {
    payload = JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    throw new Error("The server returned an unreadable response. Check the Apps Script deployment URL and access setting.");
  }
  if (!payload.success) {
    throw new Error(payload.error || "The request could not be completed.");
  }
  return payload;
}

export async function listItems(): Promise<Item[]> {
  requireUrl();
  const url = new URL(API_URL);
  url.searchParams.set("action", "listItems");
  const response = await fetch(url.toString(), { cache: "no-store" });
  const payload = await readPayload(response);
  return payload.items ?? [];
}

export async function listOrders(): Promise<Order[]> {
  requireUrl();
  const url = new URL(API_URL);
  url.searchParams.set("action", "listOrders");
  const response = await fetch(url.toString(), { cache: "no-store" });
  const payload = await readPayload(response);
  return payload.orders ?? [];
}

export async function postAction<T>(body: Record<string, unknown>): Promise<T> {
  requireUrl();
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
    redirect: "follow",
    cache: "no-store",
  });
  const payload = await readPayload(response);
  return payload.result as T;
}

export function addOrder(itemId: number, quantity: number): Promise<Order> {
  return postAction<Order>({ action: "addOrder", itemId, quantity });
}

export function addItem(input: AddItemInput): Promise<Item> {
  return postAction<Item>({ action: "addItem", ...input });
}

export function updateOrderStatus(id: number, status: string): Promise<Order> {
  return postAction<Order>({ action: "updateOrderStatus", id, status });
}

export function updatePaymentStatus(id: number, paymentStatus: string): Promise<Order> {
  return postAction<Order>({ action: "updatePaymentStatus", id, paymentStatus });
}
