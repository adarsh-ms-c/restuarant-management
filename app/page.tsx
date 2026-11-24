"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AdminGate from "@/components/AdminGate";
import CartDrawer from "@/components/CartDrawer";
import OrderConfirm from "@/components/OrderConfirm";
import OrderTracker from "@/components/OrderTracker";
import { useToast } from "@/components/Toast";
import { useData } from "@/lib/data";
import { addOrder } from "@/lib/api";
import { errorMessage, money } from "@/lib/format";
import {
  forgetStoredOrder,
  rememberOrder,
  replaceStoredOrder,
} from "@/lib/local";
import { useStoredOrderIds } from "@/lib/useStoredOrders";
import { ADMIN_SESSION_KEY } from "@/lib/config";
import type { Item, Order } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const {
    items,
    loading,
    error,
    refresh,
    addLocalOrder,
    resolveLocalOrder,
    removeLocalOrder,
  } = useData();
  const { notify } = useToast();
  const [adminOpen, setAdminOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const storedOrderIds = useStoredOrderIds();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [placing, setPlacing] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ item: Item; quantity: number } | null>(null);

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

  function quantityFor(id: number) {
    return Math.max(1, quantities[id] ?? 1);
  }

  function changeQuantity(id: number, value: number) {
    setQuantities((previous) => ({ ...previous, [id]: Math.max(1, value) }));
  }

  function askOrder(item: Item) {
    const quantity = quantityFor(item.id);
    if (item.stock < 1) return;
    if (quantity > item.stock) {
      notify(`Only ${item.stock} left in stock.`, "err");
      return;
    }
    setPendingOrder({ item, quantity });
  }

  async function placeOrder() {
    if (!pendingOrder) return;
    const { item, quantity } = pendingOrder;
    setPendingOrder(null);
    setPlacing(item.id);

    const tempId = -Date.now();
    const tempOrder: Order = {
      id: tempId,
      itemId: item.id,
      quantity,
      total: item.price * quantity,
      status: "PENDING",
      paymentStatus: "UNPAID",
      stockDeducted: false,
    };
    addLocalOrder(tempOrder);
    rememberOrder(tempId);
    notify("Placing your order...");

    try {
      const order = await addOrder(item.id, quantity);
      replaceStoredOrder(tempId, order.id);
      resolveLocalOrder(tempId, order);
      notify(`Order #${order.id} placed. Status: ${order.status}.`);
      void refresh();
    } catch (err) {
      removeLocalOrder(tempId);
      forgetStoredOrder(tempId);
      notify(errorMessage(err), "err");
    } finally {
      setPlacing(null);
    }
  }

  function unlockAdmin() {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    setAdminOpen(false);
    router.push("/admin");
  }

  return (
    <>
      <AppHeader
        mode="user"
        onAdminClick={() => setAdminOpen(true)}
        onCartClick={() => setCartOpen(true)}
        cartCount={storedOrderIds.length}
      />
      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-10 sm:px-6">
        <section className="card overflow-hidden">
          <div className="hero-panel px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-medium text-cream">Welcome to</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Coffee Time</h1>
            <p className="mt-3 max-w-xl text-sm text-cream">
              Pick your favourites, choose a quantity, and place an order. Track it any time from this page.
            </p>
          </div>
        </section>

        <section id="menu" className="scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-charcoal">Menu</h2>
              <p className="mt-1 text-sm text-muted">{items.length} items available</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
                              onClick={() => changeQuantity(item.id, quantityFor(item.id) - 1)}
                              className="px-3 py-1 text-lg text-muted hover:text-brick-600"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{quantityFor(item.id)}</span>
                            <button
                              type="button"
                              aria-label={`Increase quantity for ${item.name}`}
                              onClick={() => changeQuantity(item.id, quantityFor(item.id) + 1)}
                              className="px-3 py-1 text-lg text-muted hover:text-brick-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => askOrder(item)}
                          disabled={outOfStock || placing === item.id}
                          className="btn-primary w-full"
                        >
                          {placing === item.id ? "Placing..." : "Order now"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <OrderTracker />
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {pendingOrder && (
        <OrderConfirm
          item={pendingOrder.item}
          quantity={pendingOrder.quantity}
          onCancel={() => setPendingOrder(null)}
          onConfirm={() => void placeOrder()}
        />
      )}
      {adminOpen && (
        <AdminGate
          onClose={() => setAdminOpen(false)}
          onSuccess={unlockAdmin}
        />
      )}
    </>
  );
}
