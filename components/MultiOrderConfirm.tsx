"use client";

import { money } from "@/lib/format";
import type { OrderSelection } from "@/lib/useOrderPlacement";

type Props = {
  selections: OrderSelection[];
  placing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function MultiOrderConfirm({ selections, placing, onCancel, onConfirm }: Props) {
  const total = selections.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !placing) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="multi-order-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-panel"
      >
        <h2 id="multi-order-title" className="text-lg font-semibold text-charcoal">
          Place multiple orders
        </h2>
        <p className="mt-1 text-sm text-muted">Each selected item will be placed as a separate order.</p>

        <div className="mt-5 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-line bg-paper p-3">
          {selections.map(({ item, quantity }) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-charcoal">{item.name}</p>
                <p className="text-xs text-muted">{money(item.price)} each</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-charcoal">x {quantity}</p>
                <p className="text-xs font-bold text-brick-600">{money(item.price * quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-3 text-base font-bold text-charcoal">
          <span>{selections.length} orders</span>
          <span className="text-brick-600">{money(total)}</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={placing}
            className="px-3 py-2 text-sm font-medium text-muted hover:text-charcoal"
          >
            Edit quantities
          </button>
          <button type="button" onClick={onCancel} disabled={placing} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={placing} className="btn-primary" autoFocus>
            {placing ? "Placing..." : `Place ${selections.length} orders`}
          </button>
        </div>
      </div>
    </div>
  );
}
