import { z } from "zod";
import { inventoryTransaction, type InventoryRepository } from "@/features/inventory/domain";
import type { Order } from "./types";

export const cancellationReasons = [
  "customer_request",
  "out_of_stock",
  "duplicate",
  "other",
] as const;
export const cancellationSchema = z
  .object({
    code: z.enum(cancellationReasons),
    note: z.string().trim().max(500),
  })
  .refine((reason) => reason.code !== "other" || reason.note.length > 0);
export type CancellationReason = z.infer<typeof cancellationSchema>;
export class CancellationError extends Error {
  constructor(public readonly code: "ineligible" | "inventory" | "reason" | "storage") {
    super(code);
  }
}
export function canCancelOrder(order: Order) {
  return (
    !order.archivedAt &&
    ["pending_payment", "paid", "packaged"].includes(order.status) &&
    order.inventory?.state !== "committed"
  );
}

export function cancelOrderTransaction(
  repository: InventoryRepository,
  order: Order,
  reason: CancellationReason,
  timestamp = new Date().toISOString(),
) {
  const receipt = repository.receipts[order.id];
  if (receipt && receipt.order.id !== order.id) throw new CancellationError("inventory");
  if (receipt?.state === "released" && receipt.order.status === "cancelled")
    return { repository, order: receipt.order };
  if (order.status === "cancelled") return { repository, order };
  if (!canCancelOrder(order) || receipt?.state === "committed")
    throw new CancellationError("ineligible");
  const parsed = cancellationSchema.safeParse(reason);
  if (!parsed.success) throw new CancellationError("reason");
  try {
    const result = inventoryTransaction(repository, order, "cancel");
    const cancelled: Order = {
      ...result.order,
      status: "cancelled",
      cancelledAt: timestamp,
      cancellationReason: parsed.data,
    };
    result.repository.receipts[order.id] = {
      ...result.repository.receipts[order.id],
      state: "released",
      entries: result.repository.receipts[order.id]?.entries ?? [],
      order: cancelled,
    };
    return { repository: result.repository, order: cancelled };
  } catch {
    throw new CancellationError("inventory");
  }
}
