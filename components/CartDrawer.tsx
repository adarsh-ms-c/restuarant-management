"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import { clearStoredOrders } from "@/lib/local";
import { money } from "@/lib/format";
import { TRACK_ORDER_KEY } from "@/lib/config";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
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
    if (document.getElementById("track")) {
      window.dispatchEvent(new CustomEvent("rm-track-order", { detail: id }));
      window.setTimeout(() => {
        document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }
    window.sessionStorage.setItem(TRACK_ORDER_KEY, String(id));
    router.push("/track#track");
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-overlay backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-panel">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">Your cart</h2>
            <p className="mt-1 text-xs text-muted">Orders placed from this device</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg px-2 py-1 text-xl leading-none text-muted hover:bg-paper"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {placed.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-sm font-medium text-charcoal">Your cart is empty</p>
              <p className="mt-2 text-sm text-muted">Place an order from the menu to see it here.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/menu");
                }}
                className="btn-primary mt-5"
              >
                Browse menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {placed.map((order) => {
                const item = items.find((entry) => entry.id === order.itemId);
                return (
                  <div key={order.id} className="rounded-xl border border-line p-4">
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
                            <p className="truncate font-semibold text-charcoal">
                              {item?.name ?? `Item #${order.itemId} (deleted)`}
                            </p>
                            <p className="text-xs text-muted">Order #{order.id} · Qty {order.quantity}</p>
                          </div>
                          <span className="font-bold text-brick-600">{money(order.total)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`badge ${
                              order.status === "APPROVED" || order.status === "COMPLETED"
                                ? "bg-success-100 text-success-700"
                                : order.status === "REJECTED"
                                  ? "bg-danger-100 text-danger-700"
                                  : "bg-warning-100 text-warning-700"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span
                            className={`badge ${
                              order.paymentStatus === "PAID"
                                ? "bg-success-100 text-success-700"
                                : "bg-line text-muted"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => track(order.id)}
                          className="mt-3 text-xs font-semibold text-brick-600 hover:underline"
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

        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Total spent</span>
            <span className="text-lg font-bold text-charcoal">{money(spent)}</span>
          </div>
          {placed.length > 0 && (
            <div className="mt-3">
              {confirmClear ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-danger-50 px-3 py-2">
                  <span className="text-xs text-danger-700">Clear this list from your device?</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmClear(false)} className="text-xs font-semibold text-muted">
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearStoredOrders();
                        setConfirmClear(false);
                      }}
                      className="text-xs font-semibold text-danger-700"
                    >
                      Yes, clear
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-xs font-medium text-muted hover:text-danger-600"
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
