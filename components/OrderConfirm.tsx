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
      className="fixed inset-0 z-40 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirm-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel"
      >
        <h2 id="order-confirm-title" className="text-lg font-semibold text-charcoal">
          Confirm your order
        </h2>
        <p className="mt-1 text-sm text-muted">Please check the details before placing it.</p>

        <div className="mt-5 flex items-center gap-4 rounded-xl border border-line bg-paper p-4">
          <img
            src={item.imgUrl || "/placeholder.svg"}
            alt={item.name}
            className="h-16 w-16 rounded-lg object-cover"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-charcoal">{item.name}</p>
            <p className="text-sm text-muted">{money(item.price)} each</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <span>Quantity</span>
            <span className="font-medium text-charcoal">{quantity}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Available stock</span>
            <span className="font-medium text-charcoal">{item.stock}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold text-charcoal">
            <span>Total</span>
            <span className="text-brick-600">{money(item.price * quantity)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm font-medium text-muted hover:text-charcoal">
            Cancel
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Add more items
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary" autoFocus>
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}
