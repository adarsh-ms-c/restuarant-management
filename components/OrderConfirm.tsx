"use client";

import { money } from "@/lib/format";
import type { Item } from "@/lib/types";

type Props = {
  item: Item;
  quantity: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function OrderConfirm({ item, quantity, onCancel, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirm-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="order-confirm-title" className="text-lg font-semibold text-slate-900">
          Confirm your order
        </h2>
        <p className="mt-1 text-sm text-slate-500">Please check the details before placing it.</p>

        <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={item.imgUrl || "/placeholder.svg"}
            alt={item.name}
            className="h-16 w-16 rounded-lg object-cover"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{item.name}</p>
            <p className="text-sm text-slate-500">{money(item.price)} each</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Quantity</span>
            <span className="font-medium text-slate-900">{quantity}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Available stock</span>
            <span className="font-medium text-slate-900">{item.stock}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="text-indigo-600">{money(item.price * quantity)}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary" autoFocus>
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}
