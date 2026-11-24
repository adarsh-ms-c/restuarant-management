"use client";

import { useCallback, useEffect, useState } from "react";
import { useData } from "@/lib/data";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import { money } from "@/lib/format";
import { TRACK_ORDER_KEY } from "@/lib/config";

const FLOW = ["PENDING", "APPROVED", "COMPLETED"];

export default function OrderTracker() {
  const { orders, items } = useData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const recent = useStoredOrderIds().slice(0, 8);
  const placedOrders = recent
    .map((id) => orders.find((order) => order.id === id))
    .filter((order): order is NonNullable<typeof order> => Boolean(order));
  const explicitSelected = selectedId !== null
    ? orders.find((order) => order.id === selectedId) ?? null
    : null;
  const selected = explicitSelected ?? placedOrders[0] ?? null;

  const lookup = useCallback((id?: number) => {
    const numeric = Number(id ?? query);
    if (!Number.isInteger(numeric) || numeric < 1) {
      setError("Enter a valid order ID.");
      setSelectedId(null);
      return;
    }
    const found = orders.find((order) => order.id === numeric);
    if (!found) {
      setError("Order not found in the current list.");
      setSelectedId(null);
      return;
    }
    setError("");
    setSelectedId(numeric);
    if (!id) setQuery(String(numeric));
  }, [orders, query]);

  function selectOrder(id: number) {
    setQuery(String(id));
    setError("");
    setSelectedId(id);
  }

  useEffect(() => {
    function handleTrack(event: Event) {
      const id = (event as CustomEvent<number>).detail;
      setQuery(String(id));
      lookup(id);
    }
    window.addEventListener("rm-track-order", handleTrack);
    return () => window.removeEventListener("rm-track-order", handleTrack);
  }, [lookup]);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(TRACK_ORDER_KEY);
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) {
      window.sessionStorage.removeItem(TRACK_ORDER_KEY);
      return;
    }
    if (!orders.some((order) => order.id === id)) return;
    const timer = window.setTimeout(() => {
      window.sessionStorage.removeItem(TRACK_ORDER_KEY);
      setQuery(String(id));
      lookup(id);
      document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [orders, lookup]);

  const itemName = (id: number) =>
    items.find((item) => item.id === id)?.name ?? `Item #${id} (deleted)`;

  const statusClass = (status: string) =>
    status === "APPROVED" || status === "COMPLETED"
      ? "bg-success-100 text-success-700"
      : status === "REJECTED"
        ? "bg-danger-100 text-danger-700"
        : "bg-warning-100 text-warning-700";

  const activeIndex = selected ? FLOW.indexOf(selected.status) : -1;

  return (
    <section id="track" className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-charcoal">Track an order</h2>
      <p className="mt-1 text-sm text-muted">Check the latest status and payment update for any order.</p>
      <div className="card mt-4 p-5 sm:p-6">
        {placedOrders.length > 0 && (
          <div className="mb-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Your orders</h3>
                <p className="mt-1 text-xs text-muted">Orders placed from this device appear here automatically.</p>
              </div>
              <span className="text-xs text-muted">{placedOrders.length} on this device</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {placedOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => selectOrder(order.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected?.id === order.id
                      ? "border-brick-600 bg-brick-50"
                      : "border-line bg-card hover:border-brick-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-charcoal">Order #{order.id}</span>
                    <span className="font-bold text-brick-600">{money(order.total)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">
                    {itemName(order.itemId)} x {order.quantity}
                  </p>
                  <span className={`badge mt-2 ${statusClass(order.status)}`}>{order.status}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <form
          className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            lookup();
          }}
        >
          <input
            className="input sm:max-w-xs"
            inputMode="numeric"
            placeholder="Order ID, e.g. 12"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" className="btn-primary sm:w-32">Track</button>
        </form>
        {error && <p className="mt-3 text-sm font-medium text-danger-600">{error}</p>}
        {selected && (
          <div className="mt-5 rounded-xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-charcoal">Order #{selected.id}</p>
                <p className="text-sm text-muted">
                  {itemName(selected.itemId)} x {selected.quantity}
                </p>
              </div>
              <p className="text-lg font-bold text-brick-600">{money(selected.total)}</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {FLOW.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      selected.status === "REJECTED" && index === 0
                        ? "bg-danger-100 text-danger-700"
                        : index <= activeIndex
                          ? "bg-success-100 text-success-700"
                          : "bg-line text-muted"
                    }`}
                  >
                    {step}
                  </span>
                  {index < FLOW.length - 1 && <span className="text-line">→</span>}
                </div>
              ))}
              {selected.status === "REJECTED" && (
                <span className="badge bg-danger-100 text-danger-700">REJECTED</span>
              )}
              <span
                className={`badge ${
                  selected.paymentStatus === "PAID"
                    ? "bg-success-100 text-success-700"
                    : "bg-warning-100 text-warning-700"
                }`}
              >
                {selected.paymentStatus}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted">
              Stock deducted: {selected.stockDeducted ? "Yes" : "No"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
