"use client";

import { useMemo, useState } from "react";
import UserShell from "@/components/UserShell";
import MultiOrderConfirm from "@/components/MultiOrderConfirm";
import OrderConfirm from "@/components/OrderConfirm";
import OrderPlaced from "@/components/OrderPlaced";
import OrderTracker from "@/components/OrderTracker";
import { useToast } from "@/components/Toast";
import { useData } from "@/lib/data";
import { money } from "@/lib/format";
import { forgetStoredOrder } from "@/lib/local";
import { useOrderPlacement } from "@/lib/useOrderPlacement";
import type { OrderSelection } from "@/lib/useOrderPlacement";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import type { Item } from "@/lib/types";

export default function TrackPage() {
  const { items, orders, loading, removeLocalOrder } = useData();
  const { notify } = useToast();
  const {
    placeOne,
    placeMany,
    isPlacing,
    placingMany,
    placedOrders,
    clearPlacedOrders,
  } = useOrderPlacement();
  const storedOrderIds = useStoredOrderIds();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [pendingOrder, setPendingOrder] = useState<{ item: Item; quantity: number } | null>(null);
  const [pendingSelections, setPendingSelections] = useState<OrderSelection[] | null>(null);

  const deviceOrders = storedOrderIds
    .map((id) => orders.find((order) => order.id === id))
    .filter((order): order is NonNullable<typeof order> => Boolean(order));

  const itemName = (id: number) =>
    items.find((item) => item.id === id)?.name ?? `Item #${id} (deleted)`;

  const statusClass = (status: string) =>
    status === "APPROVED" || status === "COMPLETED"
      ? "bg-success-100 text-success-700"
      : status === "REJECTED"
        ? "bg-danger-100 text-danger-700"
        : "bg-warning-100 text-warning-700";

  function quantityFor(id: number) {
    return Math.max(0, quantities[id] ?? 0);
  }

  function changeQuantity(id: number, value: number) {
    setQuantities((previous) => ({ ...previous, [id]: Math.max(0, value) }));
  }

  const selections = useMemo(() => {
    const quantity = (id: number) => Math.max(0, quantities[id] ?? 0);
    return items
      .filter((item) => quantity(item.id) > 0)
      .map((item) => ({ item, quantity: quantity(item.id) }));
  }, [items, quantities]);

  function askOrder(item: Item) {
    const quantity = quantityFor(item.id);
    if (item.stock < 1) return;
    if (quantity < 1) {
      notify("Choose a quantity first.", "err");
      return;
    }
    if (quantity > item.stock) {
      notify(`Only ${item.stock} left in stock.`, "err");
      return;
    }
    setPendingOrder({ item, quantity });
  }

  function askMultipleOrders() {
    if (selections.length === 0) {
      notify("Choose a quantity for at least one item.", "err");
      return;
    }
    const invalid = selections.find(
      ({ item, quantity }) => item.stock < 1 || quantity > item.stock
    );
    if (invalid) {
      notify(`Only ${invalid.item.stock} left for ${invalid.item.name}.`, "err");
      return;
    }
    setPendingSelections(selections);
  }

  async function placeOrder() {
    if (!pendingOrder) return;
    const { item, quantity } = pendingOrder;
    setPendingOrder(null);
    const order = await placeOne(item, quantity);
    if (order) {
      setQuantities((previous) => ({ ...previous, [item.id]: 0 }));
    }
  }

  async function placeSelectedOrders() {
    if (!pendingSelections) return;
    const selected = pendingSelections;
    setPendingSelections(null);
    const successful = await placeMany(selected);
    if (successful.length > 0) {
      setQuantities((previous) => {
        const next = { ...previous };
        for (const entry of successful) next[entry.order.itemId] = 0;
        return next;
      });
    }
  }

  function removeOrder(id: number) {
    forgetStoredOrder(id);
    removeLocalOrder(id);
    notify(`Order #${id} removed from this device.`);
  }

  return (
    <UserShell>
      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-10 sm:px-6">
        <section className="card overflow-hidden">
          <div className="hero-panel px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-medium text-cream">Slo Labs</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Track your order</h1>
            <p className="mt-3 max-w-xl text-sm text-cream">
              See the orders you placed on this device, place new ones, and check their latest status.
            </p>
          </div>
        </section>

        <OrderTracker />

        <section id="manage-orders">
          <div>
            <h2 className="text-xl font-semibold text-charcoal">Manage your orders</h2>
            <p className="mt-1 text-sm text-muted">Remove orders from this device when you no longer need to track them.</p>
          </div>
          {deviceOrders.length === 0 ? (
            <div className="card mt-5 p-8 text-center text-sm text-muted">No orders on this device yet.</div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {deviceOrders.map((order) => (
                <div key={order.id} className="card flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal">Order #{order.id}</p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {itemName(order.itemId)} x {order.quantity}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
                      <span className="text-sm font-bold text-brick-600">{money(order.total)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOrder(order.id)}
                    className="btn-danger shrink-0"
                    aria-label={`Remove order ${order.id} from this device`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="shop-items">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-charcoal">All items in the shop</h2>
              <p className="mt-1 text-sm text-muted">{items.length} items available</p>
            </div>
            <button
              type="button"
              onClick={askMultipleOrders}
              disabled={placingMany || selections.length === 0}
              className="btn-secondary"
            >
              {placingMany ? "Placing..." : `Place multiple (${selections.length})`}
            </button>
          </div>
          {loading && items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted">Loading items...</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const outOfStock = item.stock < 1;
                const quantity = quantityFor(item.id);
                return (
                  <article key={item.id} className="card flex overflow-hidden">
                    <div className="h-28 w-28 shrink-0 bg-cream">
                      <img
                        src={item.imgUrl || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-3">
                      <p className="font-semibold text-charcoal">{item.name}</p>
                      <p className="mt-1 text-sm font-bold text-brick-600">{money(item.price)}</p>
                      <p className="mt-1 text-xs text-muted">Stock: {item.stock}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-lg border border-line">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            onClick={() => changeQuantity(item.id, quantity - 1)}
                            disabled={placingMany}
                            className="px-2 py-1 text-lg text-muted hover:text-brick-600"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            onClick={() => changeQuantity(item.id, quantity + 1)}
                            disabled={placingMany}
                            className="px-2 py-1 text-lg text-muted hover:text-brick-600"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => askOrder(item)}
                          disabled={outOfStock || isPlacing(item.id) || placingMany || quantity < 1}
                          className="btn-primary px-3 py-1.5 text-xs"
                        >
                          {isPlacing(item.id) ? "Placing..." : "Order now"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      {pendingOrder && (
        <OrderConfirm
          item={pendingOrder.item}
          quantity={pendingOrder.quantity}
          onCancel={() => setPendingOrder(null)}
          onConfirm={() => void placeOrder()}
        />
      )}
      {pendingSelections && (
        <MultiOrderConfirm
          selections={pendingSelections}
          placing={placingMany}
          onCancel={() => setPendingSelections(null)}
          onConfirm={() => void placeSelectedOrders()}
        />
      )}
      {placedOrders.length > 0 && (
        <OrderPlaced orders={placedOrders} onClose={clearPlacedOrders} />
      )}
    </UserShell>
  );
}
