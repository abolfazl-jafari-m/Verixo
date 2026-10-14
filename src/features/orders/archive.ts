import type { Order } from "./types";

export const activeOrders = (orders: Order[]) => orders.filter((order) => !order.archivedAt);
export const archivedOrders = (orders: Order[]) => orders.filter((order) => !!order.archivedAt);
export const canArchiveOrder = (order: Order) => order.status === "delivered" && !order.archivedAt;

export interface ArchiveResult {
  changed: string[];
  skipped: string[];
  failed: string[];
}

// Persist each record before publishing it. A failed write leaves that order unchanged.
// Archive metadata is independent of financial eligibility and all historical snapshots.
export function changeOrderArchive(
  orders: Order[],
  ids: string[],
  restore: boolean,
  persist: (order: Order) => boolean,
  timestamp = new Date().toISOString(),
) {
  const result: ArchiveResult = { changed: [], skipped: [], failed: [] };
  const updates = new Map<string, Order>();
  for (const id of new Set(ids)) {
    const order = orders.find((item) => item.id === id);
    if (!order || !(restore ? !!order.archivedAt : canArchiveOrder(order))) {
      result.skipped.push(id);
      continue;
    }
    const next = { ...order, archivedAt: restore ? null : timestamp };
    if (persist(next)) {
      updates.set(id, next);
      result.changed.push(id);
    } else result.failed.push(id);
  }
  return { orders: orders.map((order) => updates.get(order.id) ?? order), result };
}
