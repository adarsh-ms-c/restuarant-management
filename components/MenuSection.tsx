"use client";

import { useMemo, useState } from "react";
import MultiOrderConfirm from "@/components/MultiOrderConfirm";
import OrderConfirm from "@/components/OrderConfirm";
import OrderPlaced from "@/components/OrderPlaced";
import { useToast } from "@/components/Toast";
import { useData } from "@/lib/data";
import { money } from "@/lib/format";
import { useOrderPlacement } from "@/lib/useOrderPlacement";
import type { OrderSelection } from "@/lib/useOrderPlacement";
import type { Item } from "@/lib/types";

export default function MenuSection() {
  const { items, loading, error, refresh } = useData();
  const { notify } = useToast();
  const {
    placeOne,
    placeMany,
    isPlacing,
    placingMany,
    placedOrders,
    clearPlacedOrders,
  } = useOrderPlacement();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [pendingOrder, setPendingOrder] = useState<{ item: Item; quantity: number } | null>(null);
  const [pendingSelections, setPendingSelections] = useState<OrderSelection[] | null>(null);

  function quantityFor(id: number) {
    return Math.max(0, quantities[id] ?? 0);
  }

  function changeQuantity(id: number, value: number) {
    setQuantities((previous) => ({ ...previous, [id]: Math.max(0, value) }));
  }

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = items.filter((item) => item.name.toLowerCase().includes(term));
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "stock") return a.stock - b.stock;
      return a.name.localeCompare(b.name);
    });
  }, [items, search, sort]);

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

  return (
    <>
      <section id="menu" className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-charcoal">Menu</h2>
            <p className="mt-1 text-sm text-muted">{items.length} items available</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={askMultipleOrders}
              disabled={placingMany || selections.length === 0}
              className="btn-secondary"
            >
              {placingMany ? "Placing..." : `Place multiple (${selections.length})`}
            </button>
            <input
              className="input sm:w-64"
              placeholder="Search items..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="input sm:w-44" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="stock">Stock: Low to high</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
            <button type="button" onClick={() => void refresh()} className="ml-2 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {loading && items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted">Loading menu...</p>
        ) : visibleItems.length === 0 ? (
          <div className="card mt-5 p-10 text-center text-sm text-muted">No items found.</div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => {
              const outOfStock = item.stock < 1;
              const lowStock = item.stock > 0 && item.stock <= 5;
              const quantity = quantityFor(item.id);
              return (
                <article key={item.id} className="card flex flex-col overflow-hidden">
                  <div className="h-40 bg-cream">
                    <img
                      src={item.imgUrl || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-charcoal">{item.name}</h3>
                      <span className="font-bold text-brick-600">{money(item.price)}</span>
                    </div>
                    <span
                      className={`badge mt-2 self-start ${
                        outOfStock
                          ? "bg-danger-100 text-danger-700"
                          : lowStock
                            ? "bg-warning-100 text-warning-700"
                            : "bg-success-100 text-success-700"
                      }`}
                    >
                      {outOfStock ? "OUT OF STOCK" : lowStock ? `LOW STOCK (${item.stock})` : "IN STOCK"}
                    </span>
                    <div className="mt-auto pt-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted">Quantity</span>
                        <div className="flex items-center rounded-lg border border-line">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            onClick={() => changeQuantity(item.id, quantity - 1)}
                            disabled={placingMany}
                            className="px-3 py-1 text-lg text-muted hover:text-brick-600"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            onClick={() => changeQuantity(item.id, quantity + 1)}
                            disabled={placingMany}
                            className="px-3 py-1 text-lg text-muted hover:text-brick-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => askOrder(item)}
                        disabled={outOfStock || isPlacing(item.id) || placingMany || quantity < 1}
                        className="btn-primary w-full"
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
    </>
  );
}
