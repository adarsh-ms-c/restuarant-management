"use client";

import { useCallback, useEffect, useState } from "react";
import { useData } from "@/lib/data";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import { money } from "@/lib/format";
import type { Order } from "@/lib/types";

const FLOW = ["PENDING", "APPROVED", "COMPLETED"];

export default function OrderTracker() {
  const { orders, items } = useData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const recent = useStoredOrderIds().slice(0, 8);

  const lookup = useCallback((id?: number) => {
    const numeric = Number(id ?? query);
    if (!Number.isInteger(numeric) || numeric < 1) {
      setError("Enter a valid order ID.");
      setSelected(null);
      return;
    }
    const found = orders.find((order) => order.id === numeric);
    if (!found) {
      setError("Order not found in the current list.");
      setSelected(null);
      return;
    }
    setError("");
    setSelected(found);
    if (!id) setQuery(String(numeric));
  }, [orders, query]);

  useEffect(() => {
    function handleTrack(event: Event) {
      const id = (event as CustomEvent<number>).detail;
      setQuery(String(id));
      lookup(id);
    }
    window.addEventListener("rm-track-order", handleTrack);
    return () => window.removeEventListener("rm-track-order", handleTrack);
  }, [lookup]);

  const itemName = (id: number) =>
    items.find((item) => item.id === id)?.name ?? `Item #${id} (deleted)`;

  const activeIndex = selected ? FLOW.indexOf(selected.status) : -1;

  return (
    <section id="track" className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-charcoal">Track an order</h2>
      <p className="mt-1 text-sm text-muted">Check the latest status and payment update for any order.</p>
      <div className="card mt-4 p-5 sm:p-6">
        {recent.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Recent</span>
            {recent.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setQuery(String(id));
                  lookup(id);
                }}
                className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted hover:border-brick-200 hover:text-brick-600"
              >
                #{id}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex flex-col gap-2 sm:flex-row"
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
