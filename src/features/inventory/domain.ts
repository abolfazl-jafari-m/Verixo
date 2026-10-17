import type { InventoryFields, Product } from "@/features/products/types";
import type { InventoryRequirement, Order, OrderInventory } from "@/features/orders/types";

export const inventoryKey = (productId: string, variantId?: string) =>
  JSON.stringify([productId, variantId ?? null]);
export const wholeQuantity = (value: number) => Number.isSafeInteger(value) && value >= 0;
export function inventoryValues(item: InventoryFields) {
  const reserved = item.reservedQuantity ?? 0;
  return {
    stock: item.stock,
    reserved,
    available: item.stock - reserved,
    threshold: item.lowStockThreshold ?? 5,
    tracked: item.trackInventory ?? true,
  };
}
export function inventoryStatus(item: InventoryFields) {
  const value = inventoryValues(item);
  return !value.tracked
    ? "untracked"
    : value.available === 0
      ? "out"
      : value.available <= value.threshold
        ? "low"
        : "in";
}
export function inventoryRows(products: Product[]) {
  return products.flatMap((product) =>
    (product.type === "simple"
      ? [{ item: product, variantId: undefined, label: "", active: true }]
      : product.variants.map((item) => ({
          item,
          variantId: item.id,
          label: Object.values(item.attributeValues).join(" / "),
          active: item.isActive,
        }))
    ).map((row) => ({ ...row, product, key: inventoryKey(product.id, row.variantId) })),
  );
}
export function inventorySummary(products: Product[]) {
  const rows = inventoryRows(products).filter(
    (row) => row.active && inventoryValues(row.item).tracked,
  );
  return {
    tracked: rows.length,
    low: rows.filter((row) => inventoryStatus(row.item) === "low").length,
    out: rows.filter((row) => inventoryStatus(row.item) === "out").length,
    stock: rows.reduce((sum, row) => sum + row.item.stock, 0),
    reserved: rows.reduce((sum, row) => sum + (row.item.reservedQuantity ?? 0), 0),
    available: rows.reduce((sum, row) => sum + inventoryValues(row.item).available, 0),
  };
}
export function validateInventory(item: InventoryFields) {
  const value = inventoryValues(item);
  if (
    ![value.stock, value.reserved, value.threshold].every(wholeQuantity) ||
    value.reserved > value.stock
  )
    throw new Error("Invalid inventory quantities");
}
export interface InventoryReceipt {
  state: OrderInventory["state"];
  entries: InventoryRequirement[];
  order: Order;
}
export interface InventoryRepository {
  products: Product[];
  receipts: Record<string, InventoryReceipt>;
}

// Pure transaction: all validation happens on a copy; callers publish the entire result once.
export function inventoryTransaction(
  repository: InventoryRepository,
  order: Order,
  event: "reserve" | "complete" | "cancel",
) {
  if (event !== "cancel" && order.payment !== "paid")
    throw new Error("Payment must be confirmed before reserving inventory");
  if (order.inventory?.state === "committed") return { repository, order };
  const next = structuredClone(repository);
  const previous = next.receipts[order.id];
  if (
    previous?.state === "committed" ||
    previous?.state === "released" ||
    (previous?.state === "reserved" && event === "reserve")
  )
    return { repository, order: { ...order, inventory: { state: previous.state, issues: [] } } };
  const rows = inventoryRows(next.products);
  const byKey = new Map(rows.map((row) => [row.key, row]));
  let entries = previous?.state === "reserved" ? previous.entries : [];
  if (!previous || previous.state === "exception") {
    const required = new Map<string, InventoryRequirement>();
    for (const line of order.lines) {
      if (!wholeQuantity(line.quantity) || line.quantity === 0)
        throw new Error("Invalid order quantity");
      const key = inventoryKey(line.productId, line.variantId);
      const found = required.get(key);
      const quantity = (found?.quantity ?? 0) + line.quantity;
      if (!wholeQuantity(quantity)) throw new Error("Invalid order quantity");
      required.set(key, {
        productId: line.productId,
        variantId: line.variantId,
        name: [line.name, line.variantLabel].filter(Boolean).join(" / "),
        quantity,
        available: 0,
      });
    }
    entries = [...required.values()].filter((entry) => {
      const row = byKey.get(inventoryKey(entry.productId, entry.variantId));
      return !row || inventoryValues(row.item).tracked;
    });
  }
  const issues: InventoryRequirement[] = [];
  if (event !== "cancel")
    for (const entry of entries) {
      const row = byKey.get(inventoryKey(entry.productId, entry.variantId));
      if (row) validateInventory(row.item);
      const available = row ? inventoryValues(row.item).available : 0;
      if (
        !row ||
        (previous?.state !== "reserved" &&
          (!row.active || row.product.status !== "active" || available < entry.quantity)) ||
        (previous?.state === "reserved" && (row.item.reservedQuantity ?? 0) < entry.quantity)
      )
        issues.push({ ...entry, available });
    }
  if (issues.length) {
    // Never discard an existing reservation on an invalid completion.
    if (previous?.state === "reserved")
      return {
        repository,
        order: { ...order, inventory: { state: "exception" as const, issues } },
      };
    const result: Order = { ...order, inventory: { state: "exception", issues } };
    next.receipts[order.id] = { state: "exception", entries: [], order: result };
    return { repository: next, order: result };
  }
  for (const entry of entries) {
    const row = byKey.get(inventoryKey(entry.productId, entry.variantId));
    if (!row) {
      if (event === "cancel") continue;
      throw new Error("Missing inventory item");
    }
    if (event === "cancel") {
      if (previous?.state === "reserved")
        row.item.reservedQuantity = (row.item.reservedQuantity ?? 0) - entry.quantity;
    } else if (event === "complete") {
      row.item.stock -= entry.quantity;
      if (previous?.state === "reserved")
        row.item.reservedQuantity = (row.item.reservedQuantity ?? 0) - entry.quantity;
    } else row.item.reservedQuantity = (row.item.reservedQuantity ?? 0) + entry.quantity;
    validateInventory(row.item);
  }
  const state = event === "cancel" ? "released" : event === "complete" ? "committed" : "reserved";
  const result: Order = { ...order, inventory: { state, issues: [] } };
  next.receipts[order.id] = { state, entries, order: result };
  return { repository: next, order: result };
}

export function adjustInventory(
  repository: InventoryRepository,
  productId: string,
  variantId: string | undefined,
  stock: number,
  lowStockThreshold: number,
) {
  const next = structuredClone(repository);
  const row = inventoryRows(next.products).find(
    (row) => row.key === inventoryKey(productId, variantId),
  );
  if (!row) throw new Error("Missing inventory item");
  Object.assign(row.item, { stock, lowStockThreshold });
  validateInventory(row.item);
  return next;
}
