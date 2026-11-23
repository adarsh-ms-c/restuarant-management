"use client";

import { useState } from "react";
import { useData } from "@/lib/data";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import { clearStoredOrders } from "@/lib/local";
import { money } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const { orders, items } = useData();
  const storedIds = useStoredOrderIds();
  const [confirmClear, setConfirmClear] = useState(false);

  if (!open) return null;

  const placed = storedIds
    .map((id) => orders.find((order) => order.id === id))
    .filter((order): order is NonNullable<typeof order> => Boolean(order));
  const spent = placed.reduce((sum, order) => sum + order.total, 0);

  function track(id: number) {
    onClose();
    window.dispatchEvent(new CustomEvent("rm-track-order", { detail: id }));
    window.setTimeout(() => {
      document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/60 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your cart</h2>
            <p className="mt-1 text-xs text-slate-500">Orders placed from this device</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {placed.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-sm font-medium text-slate-700">Your cart is empty</p>
              <p className="mt-2 text-sm text-slate-500">Place an order from the menu to see it here.</p>
              <button type="button" onClick={onClose} className="btn-primary mt-5">Browse menu</button>
            </div>
          ) : (
            <div className="space-y-3">
              {placed.map((order) => {
                const item = items.find((entry) => entry.id === order.itemId);
                return (
                  <div key={order.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item?.imgUrl || "/placeholder.svg"}
                        alt={item?.name || "Item"}
                        className="h-14 w-14 rounded-lg object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {item?.name ?? `Item #${order.itemId} (deleted)`}
                            </p>
                            <p className="text-xs text-slate-500">Order #{order.id} · Qty {order.quantity}</p>
                          </div>
                          <span className="font-bold text-indigo-600">{money(order.total)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`badge ${
                              order.status === "APPROVED" || order.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700"
                                : order.status === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span
                            className={`badge ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => track(order.id)}
                          className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Track this order →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Total spent</span>
            <span className="text-lg font-bold text-slate-900">{money(spent)}</span>
          </div>
          {placed.length > 0 && (
            <div className="mt-3">
              {confirmClear ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2">
                  <span className="text-xs text-red-700">Clear this list from your device?</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmClear(false)} className="text-xs font-semibold text-slate-600">
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearStoredOrders();
                        setConfirmClear(false);
                      }}
                      className="text-xs font-semibold text-red-700"
                    >
                      Yes, clear
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-xs font-medium text-slate-500 hover:text-red-600"
                >
                  Clear list from this device
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
