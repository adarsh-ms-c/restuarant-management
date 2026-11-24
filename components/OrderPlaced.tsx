"use client";

import { useRouter } from "next/navigation";
import { money } from "@/lib/format";
import { TRACK_ORDER_KEY } from "@/lib/config";
import type { PlacedOrder } from "@/lib/types";

type Props = {
  orders: PlacedOrder[];
  onClose: () => void;
};

export default function OrderPlaced({ orders, onClose }: Props) {
  const router = useRouter();
  const multiple = orders.length > 1;
  const total = orders.reduce((sum, entry) => sum + entry.order.total, 0);

  function trackOrders() {
    if (orders.length === 1) {
      window.sessionStorage.setItem(TRACK_ORDER_KEY, String(orders[0].order.id));
    } else {
      window.sessionStorage.removeItem(TRACK_ORDER_KEY);
    }
    onClose();
    router.push("/track#track");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-placed-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-panel"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brick-600">
          {multiple ? `${orders.length} orders confirmed` : "Order confirmed"}
        </p>
        <h2 id="order-placed-title" className="mt-1 text-xl font-semibold text-charcoal">
          {multiple ? "Your orders have been placed" : "Your order has been placed"}
        </h2>
        <p className="mt-2 text-sm text-muted">Keep the details below for reference.</p>

        <div className="mt-5 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-line bg-paper p-3">
          {orders.map(({ order, itemName, quantity }) => (
            <div key={order.id} className="rounded-lg bg-white p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-semibold text-charcoal">Order #{order.id}</span>
                <span className="font-bold text-brick-600">{money(order.total)}</span>
              </div>
              <p className="mt-1 truncate text-muted">{itemName} x {quantity}</p>
              <span className="badge mt-2 inline-block bg-warning-100 text-warning-700">{order.status}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-3 text-base font-bold text-charcoal">
          <span>{multiple ? "Combined total" : "Total"}</span>
          <span className="text-brick-600">{money(total)}</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Close</button>
          <button type="button" onClick={onClose} className="btn-secondary">Order more</button>
          <button type="button" onClick={trackOrders} className="btn-primary" autoFocus>
            {multiple ? "Track orders" : "Track order"}
          </button>
        </div>
      </div>
    </div>
  );
}
