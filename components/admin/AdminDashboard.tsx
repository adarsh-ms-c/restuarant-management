"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/components/Toast";
import { useData } from "@/lib/data";
import { addItem, updateOrderStatus, updatePaymentStatus } from "@/lib/api";
import { errorMessage, money } from "@/lib/format";
import { ADMIN_SESSION_KEY, LOW_STOCK_THRESHOLD } from "@/lib/config";
import type { Item, Order, OrderStatus, PaymentStatus } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "REFUNDED"];

type Tab = "orders" | "items" | "low";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    items,
    orders,
    loading,
    error,
    refresh,
    patchLocalOrder,
    addLocalItem,
    resolveLocalItem,
    removeLocalItem,
  } = useData();
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>("orders");
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(
    () => ({
      items: items.length,
      orders: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      approved: orders.filter((order) => order.status === "APPROVED").length,
      revenue: orders
        .filter((order) => order.paymentStatus === "PAID")
        .reduce((sum, order) => sum + order.total, 0),
      low: items.filter((item) => item.stock <= LOW_STOCK_THRESHOLD).length,
    }),
    [items, orders]
  );

  const lowStock = useMemo(
    () => items.filter((item) => item.stock <= LOW_STOCK_THRESHOLD).sort((a, b) => a.stock - b.stock),
    [items]
  );

  const itemName = (id: number) =>
    items.find((item) => item.id === id)?.name ?? `Item #${id} (deleted)`;

  async function changeStatus(order: Order, status: OrderStatus) {
    const deducted =
      status === "APPROVED"
        ? true
        : status === "REJECTED" || status === "PENDING"
          ? false
          : order.stockDeducted;
    patchLocalOrder(order.id, { status, stockDeducted: deducted });
    try {
      await updateOrderStatus(order.id, status);
      notify(`Order #${order.id} updated to ${status}.`);
    } catch (err) {
      patchLocalOrder(order.id, {
        status: order.status,
        stockDeducted: order.stockDeducted,
      });
      notify(errorMessage(err), "err");
    }
    void refresh();
  }

  async function changePayment(order: Order, paymentStatus: PaymentStatus) {
    patchLocalOrder(order.id, { paymentStatus });
    try {
      await updatePaymentStatus(order.id, paymentStatus);
      notify(`Order #${order.id} payment set to ${paymentStatus}.`);
    } catch (err) {
      patchLocalOrder(order.id, { paymentStatus: order.paymentStatus });
      notify(errorMessage(err), "err");
    }
    void refresh();
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      price: Number(data.get("price")),
      stock: Number(data.get("stock")),
      imgUrl: String(data.get("imgUrl") ?? "").trim(),
    };
    const tempId = -Date.now();
    const tempItem: Item = { id: tempId, ...payload };
    addLocalItem(tempItem);
    form.reset();
    setItemFormOpen(false);
    setSaving(true);
    notify("Adding item...");
    try {
      const created = await addItem(payload);
      resolveLocalItem(tempId, created);
      notify(`Item #${created.id} added.`);
      void refresh();
    } catch (err) {
      removeLocalItem(tempId);
      notify(errorMessage(err), "err");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    router.replace("/");
  }

  const cards = [
    { label: "Items", value: String(stats.items) },
    { label: "Orders", value: String(stats.orders) },
    { label: "Pending", value: String(stats.pending) },
    { label: "Approved", value: String(stats.approved) },
    { label: "Paid revenue", value: money(stats.revenue) },
    { label: "Low stock", value: String(stats.low) },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: "Orders" },
    { id: "items", label: "Items" },
    { id: "low", label: `Low Stock (${stats.low})` },
  ];

  return (
    <>
      <AppHeader
        mode="admin"
        onRefresh={() => void refresh()}
        onLogout={logout}
      />
      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Orders, payments, items and stock at a glance.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button type="button" onClick={() => void refresh()} className="ml-2 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {cards.map((card) => (
            <div key={card.label} className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === entry.id
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {loading && items.length === 0 && orders.length === 0 ? (
          <div className="card p-10 text-center text-sm text-slate-500">Loading dashboard...</div>
        ) : (
          <>
            {tab === "orders" && (
              <section className="card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
                  <span className="text-xs text-slate-500">{orders.length} total</span>
                </div>
                <div className="table-shell">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Stock deducted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-medium text-slate-900">#{order.id}</td>
                          <td>{itemName(order.itemId)}</td>
                          <td>{order.quantity}</td>
                          <td className="font-semibold">{money(order.total)}</td>
                          <td>
                            <select
                              className="input w-36 py-1.5"
                              value={order.status}
                              onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="input w-32 py-1.5"
                              value={order.paymentStatus}
                              onChange={(event) => void changePayment(order, event.target.value as PaymentStatus)}
                            >
                              {PAYMENT_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                order.stockDeducted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {order.stockDeducted ? "YES" : "NO"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={7} className="py-6 text-center text-slate-500">No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === "items" && (
              <section className="card p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Items</h2>
                    <p className="text-xs text-slate-500">Adding items is available; editing requires an Apps Script update.</p>
                  </div>
                  <button type="button" onClick={() => setItemFormOpen(true)} className="btn-primary">
                    + Add item
                  </button>
                </div>
                <div className="table-shell">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Image URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img
                              src={item.imgUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover"
                              onError={(event) => {
                                event.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </td>
                          <td className="font-medium text-slate-900">#{item.id}</td>
                          <td>{item.name}</td>
                          <td>{money(item.price)}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.stock < 1
                                  ? "bg-red-100 text-red-700"
                                  : item.stock <= LOW_STOCK_THRESHOLD
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.stock}
                            </span>
                          </td>
                          <td className="max-w-xs truncate text-xs text-slate-500">{item.imgUrl || "—"}</td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr><td colSpan={6} className="py-6 text-center text-slate-500">No items yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === "low" && (
              <section className="card p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-slate-900">Low stock</h2>
                <p className="mt-1 text-sm text-slate-500">Items with {LOW_STOCK_THRESHOLD} or fewer units left.</p>
                {lowStock.length === 0 ? (
                  <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
                    All items have healthy stock levels.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lowStock.map((item) => (
                      <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{money(item.price)}</p>
                        <p className="mt-2 text-sm font-bold text-amber-700">{item.stock} left</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {itemFormOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setItemFormOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-900">Add item</h2>
            <p className="mt-1 text-sm text-slate-500">Create a new item in the menu.</p>
            <form className="mt-5 space-y-4" onSubmit={(event) => void saveItem(event)}>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input id="name" name="name" className="input" required placeholder="e.g. Chocolate Coffee" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">Price</label>
                  <input id="price" name="price" type="number" min="0" step="0.01" className="input" required />
                </div>
                <div>
                  <label htmlFor="stock" className="mb-1 block text-sm font-medium text-slate-700">Stock</label>
                  <input id="stock" name="stock" type="number" min="0" step="1" className="input" required />
                </div>
              </div>
              <div>
                <label htmlFor="imgUrl" className="mb-1 block text-sm font-medium text-slate-700">Image URL</label>
                <input id="imgUrl" name="imgUrl" type="url" className="input" placeholder="https://..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setItemFormOpen(false)} className="btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
