import { z } from "zod";
import type { Product } from "@/features/products/types";
import type { Order } from "@/features/orders/types";
import { storedOrderSchema } from "@/features/orders/data/local-orders";
import {
  productDefaults,
  productFormSchema,
  toProduct,
} from "@/features/products/schemas/product-schema";
import {
  adjustInventory,
  inventoryRows,
  inventoryTransaction,
  validateInventory,
  type InventoryRepository,
} from "./domain";

export const inventoryStorageKey = "verixo:inventory:v1";
let repository: InventoryRepository = { products: [], receipts: {} };
const quantity = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const fields = {
  stock: quantity,
  trackInventory: z.boolean().optional(),
  reservedQuantity: quantity.optional(),
  lowStockThreshold: quantity.optional(),
};
const base = {
  id: z.string(),
  createdAt: z.string(),
  name: z.string(),
  description: z.string(),
  sku: z.string().optional(),
  images: z.array(z.string()),
  status: z.enum(["active", "draft", "archived"]),
  attributes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      values: z.array(z.string()),
      useForVariants: z.boolean(),
    }),
  ),
};
const price = { price: z.number().nonnegative(), costPrice: quantity.nullable() };
const productSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("simple"), ...price, ...fields }),
  z.object({
    ...base,
    type: z.literal("variable"),
    variants: z.array(
      z.object({
        id: z.string(),
        sku: z.string().optional(),
        attributeValues: z.record(z.string(), z.string()),
        isActive: z.boolean(),
        ...price,
        ...fields,
      }),
    ),
  }),
]);
const snapshotSchema = z.object({
  products: z.array(productSchema),
  receipts: z.record(
    z.string(),
    z.object({
      state: z.enum(["reserved", "committed", "released", "exception"]),
      entries: z.array(
        z.object({
          productId: z.string(),
          variantId: z.string().optional(),
          name: z.string(),
          quantity: quantity.positive(),
          available: quantity,
        }),
      ),
      order: storedOrderSchema,
    }),
  ),
});
function read(): InventoryRepository {
  if (typeof window === "undefined") return repository;
  const raw = localStorage.getItem(inventoryStorageKey);
  if (!raw) return repository;
  const parsed = snapshotSchema.parse(JSON.parse(raw));
  inventoryRows(parsed.products).forEach((row) => validateInventory(row.item));
  const receipts: InventoryRepository["receipts"] = {};
  for (const [id, receipt] of Object.entries(parsed.receipts)) {
    if (!receipt.order.invoice) throw new Error("Invalid inventory receipt");
    receipts[id] = { ...receipt, order: { ...receipt.order, invoice: receipt.order.invoice } };
  }
  repository = { products: parsed.products, receipts };
  return repository;
}
function publish(next: InventoryRepository) {
  // Publish storage before memory. Failed writes leave stock untouched.
  if (typeof window !== "undefined")
    localStorage.setItem(inventoryStorageKey, JSON.stringify(next));
  repository = next;
}
export const inventoryRepository = {
  seed(products: Product[]) {
    if (!repository.products.length) repository.products = structuredClone(products);
  },
  list() {
    return structuredClone(read().products);
  },
  save(product: Product) {
    const current = read();
    const next = structuredClone(current);
    const replacement = toProduct(productFormSchema.parse(productDefaults(product)), product);
    const previous = inventoryRows(current.products.filter((item) => item.id === product.id));
    const rows = inventoryRows([replacement]);
    for (const old of previous) {
      const row = rows.find((row) => row.key === old.key);
      const reserved = old.item.reservedQuantity ?? 0;
      if (reserved && (!row || row.item.trackInventory === false || !row.active))
        throw new Error("Resolve reservations before disabling or removing this item");
      if (row) row.item.reservedQuantity = reserved;
    }
    for (const row of rows) {
      if (!previous.some((old) => old.key === row.key)) row.item.reservedQuantity = 0;
      validateInventory(row.item);
    }
    next.products = next.products.some((item) => item.id === replacement.id)
      ? next.products.map((item) => (item.id === replacement.id ? replacement : item))
      : [replacement, ...next.products];
    publish(next);
    return structuredClone(replacement);
  },
  adjust(productId: string, variantId: string | undefined, stock: number, threshold: number) {
    publish(adjustInventory(read(), productId, variantId, stock, threshold));
  },
  applyOrder(order: Order, event: "reserve" | "complete" | "cancel") {
    const result = inventoryTransaction(read(), order, event);
    publish(result.repository);
    return result.order;
  },
  recoverOrders(orders: Order[]) {
    const current = read();
    const recovered = new Map(orders.map((order) => [order.id, order]));
    for (const [id, receipt] of Object.entries(current.receipts)) {
      const existing = recovered.get(id);
      if (!existing) recovered.set(id, receipt.order);
      else if (existing.inventory?.state !== receipt.state)
        recovered.set(id, {
          ...existing,
          payment: receipt.order.payment,
          customerFormToken: existing.customerFormToken ?? receipt.order.customerFormToken,
          status:
            receipt.state === "committed"
              ? "delivered"
              : existing.status === "pending_payment" && receipt.order.payment === "paid"
                ? "paid"
                : existing.status,
          inventory: receipt.order.inventory,
        });
    }
    return [...recovered.values()];
  },
};
