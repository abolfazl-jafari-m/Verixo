import { createPersistedRecord } from "@/lib/storage/persisted-record";
import { createMockInvoice } from "@/features/invoices/utils";
import { localOrderPrefix, storedOrderSchema } from "../data/local-orders";
import type { Order } from "../types";

export const orderStoragePrefix = "verixo:orders:v2:";
function record(id: string, initial: Order | null) {
  return createPersistedRecord<Order | null>({
    name: orderStoragePrefix + id,
    initial,
    parse(value): Order {
      const parsed = storedOrderSchema.parse(value);
      if (parsed.id !== id) throw new Error("Order identity mismatch");
      return { ...parsed, invoice: parsed.invoice ?? createMockInvoice(parsed) };
    },
    legacy(storage) {
      const key = localOrderPrefix + id;
      const raw = storage.getItem(key);
      return raw === null ? null : { value: JSON.parse(raw), keys: [key] };
    },
  });
}

export function readOrderRecords(fallback: Order[]) {
  if (typeof window === "undefined") return { orders: fallback, available: false };
  const orders = new Map(fallback.map((order) => [order.id, order]));
  try {
    const ids = new Set<string>();
    const storage = window.localStorage;
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      const prefix = key?.startsWith(orderStoragePrefix) ? orderStoragePrefix : localOrderPrefix;
      if (key?.startsWith(prefix)) ids.add(key.slice(prefix.length));
    }
    let available = true;
    for (const id of ids) {
      const entry = record(id, orders.get(id) ?? null);
      try {
        const value = entry.read().value;
        if (value) orders.set(id, value);
      } catch {
        // A valid legacy record remains readable if committing its migration hits quota.
        const value = entry.store.getState().value;
        if (value) orders.set(id, value);
        available = false;
      }
    }
    return { orders: [...orders.values()], available };
  } catch {
    return { orders: fallback, available: false };
  }
}
export function writeOrderRecord(order: Order) {
  try {
    record(order.id, order).save(order);
    return true;
  } catch {
    return false;
  }
}
