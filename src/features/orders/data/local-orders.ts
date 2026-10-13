import { createMockInvoice } from "@/features/invoices/utils";
import { invoiceRecordSchema } from "@/features/invoices/schemas/invoice-schema";
import { z } from "zod";
import { customerInformationSchema } from "../schemas/customer-information-schema";
import { orderStatuses, shippingMethods, type Order } from "../types";

// Browser-local demo storage, not a public link service or authorization boundary.
// Per-order records keep edits to different orders in separate tabs independent.
export const localOrderPrefix = "verixo:mock-orders:v1:";
const storedOrderSchema = z.object({
  id: z.string(),
  number: z.string(),
  notes: z.string(),
  createdAt: z.iso.datetime(),
  status: z.enum(orderStatuses),
  payment: z.enum(["pending", "paid"]),
  invoice: invoiceRecordSchema.optional(),
  invoiceStatus: z.enum(["not_sent", "sent"]).default("not_sent"),
  customerInformationStatus: z.enum(["pending", "submitted"]),
  customer: customerInformationSchema.nullable(),
  shippingMethod: z.enum(shippingMethods).nullable(),
  customerFormToken: z.string().nullable(),
  shipping: z.number().nonnegative(),
  lines: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      name: z.string(),
      variantLabel: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      unitCostSnapshot: z
        .number()
        .int()
        .nonnegative()
        .max(Number.MAX_SAFE_INTEGER)
        .nullable()
        .default(null),
      adjustments: z
        .object({ discount: z.number().nonnegative(), refund: z.number().nonnegative() })
        .optional(),
    }),
  ),
});

export function readLocalOrders(fallback: Order[]) {
  const orders = new Map(fallback.map((order) => [order.id, order]));
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(localOrderPrefix)) continue;
      try {
        const result = storedOrderSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
        if (result.success) {
          const order = {
            ...result.data,
            invoice: result.data.invoice ?? createMockInvoice(result.data),
          };
          orders.set(order.id, order);
          // Freeze the first settings snapshot when upgrading an older demo order.
          if (!result.data.invoice) writeLocalOrder(order);
        }
      } catch {
        /* Ignore an invalid demo record. */
      }
    }
    return { orders: [...orders.values()], available: true };
  } catch {
    return { orders: fallback, available: false };
  }
}

export function writeLocalOrder(order: Order) {
  try {
    localStorage.setItem(`${localOrderPrefix}${order.id}`, JSON.stringify(order));
    return true;
  } catch {
    return false;
  }
}
