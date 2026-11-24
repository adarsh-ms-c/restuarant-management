"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { addOrder } from "@/lib/api";
import { useData } from "@/lib/data";
import { errorMessage } from "@/lib/format";
import {
  forgetStoredOrder,
  rememberOrder,
  replaceStoredOrder,
} from "@/lib/local";
import type { Item, Order, PlacedOrder } from "@/lib/types";

export type OrderSelection = {
  item: Item;
  quantity: number;
};

let tempOrderCounter = 0;

function nextTempId() {
  tempOrderCounter += 1;
  return -(Date.now() + tempOrderCounter);
}

function tempOrder(item: Item, quantity: number, id: number): Order {
  return {
    id,
    itemId: item.id,
    quantity,
    total: item.price * quantity,
    status: "PENDING",
    paymentStatus: "UNPAID",
    stockDeducted: false,
  };
}

export function useOrderPlacement() {
  const { addLocalOrder, resolveLocalOrder, removeLocalOrder, refresh } = useData();
  const { notify } = useToast();
  const [placingIds, setPlacingIds] = useState<number[]>([]);
  const [placingMany, setPlacingMany] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

  function beginOrder(item: Item, quantity: number) {
    const id = nextTempId();
    addLocalOrder(tempOrder(item, quantity, id));
    rememberOrder(id);
    return id;
  }

  function finishOrder(tempId: number, order: Order) {
    replaceStoredOrder(tempId, order.id);
    resolveLocalOrder(tempId, order);
  }

  function cancelOrder(tempId: number) {
    removeLocalOrder(tempId);
    forgetStoredOrder(tempId);
  }

  async function placeOne(item: Item, quantity: number): Promise<Order | null> {
    setPlacingIds((previous) => [...previous, item.id]);
    const tempId = beginOrder(item, quantity);
    notify("Placing your order...");

    try {
      const order = await addOrder(item.id, quantity);
      finishOrder(tempId, order);
      setPlacedOrders([{ order, itemName: item.name, quantity }]);
      notify(`Order #${order.id} placed. Status: ${order.status}.`);
      void refresh();
      return order;
    } catch (err) {
      cancelOrder(tempId);
      notify(errorMessage(err), "err");
      return null;
    } finally {
      setPlacingIds((previous) => previous.filter((id) => id !== item.id));
    }
  }

  async function placeMany(selections: OrderSelection[]): Promise<PlacedOrder[]> {
    if (selections.length === 0) return [];
    setPlacingMany(true);
    const successful: PlacedOrder[] = [];

    for (const { item, quantity } of selections) {
      setPlacingIds((previous) => [...previous, item.id]);
      const tempId = beginOrder(item, quantity);

      try {
        const order = await addOrder(item.id, quantity);
        finishOrder(tempId, order);
        successful.push({ order, itemName: item.name, quantity });
      } catch (err) {
        cancelOrder(tempId);
        notify(`${item.name}: ${errorMessage(err)}`, "err");
        break;
      } finally {
        setPlacingIds((previous) => previous.filter((id) => id !== item.id));
      }
    }

    if (successful.length > 0) {
      setPlacedOrders(successful);
      notify(
        `${successful.length} order${successful.length === 1 ? "" : "s"} placed successfully.`
      );
      void refresh();
    }

    setPlacingMany(false);
    return successful;
  }

  function isPlacing(itemId: number) {
    return placingIds.includes(itemId);
  }

  function clearPlacedOrders() {
    setPlacedOrders([]);
  }

  return {
    placeOne,
    placeMany,
    isPlacing,
    placingMany,
    placedOrders,
    clearPlacedOrders,
  };
}
