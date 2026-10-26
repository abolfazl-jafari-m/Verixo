import { inventoryValues } from "@/features/inventory/domain";
import type { Product } from "@/features/products/types";
import type { OrderLine, OrderStatus, PaymentStatus } from "./types";

const orderDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function orderDateKey(createdAt: string) {
  return orderDateFormatter.format(new Date(createdAt));
}

export { orderTotals } from "./totals";

export function selectedProduct(product: Product | undefined, variantId: string) {
  if (!product || product.status !== "active") return undefined;
  if (product.type === "simple")
    return {
      price: product.price,
      costPrice: product.costPrice ?? null,
      stock: inventoryValues(product).available,
      trackInventory: inventoryValues(product).tracked,
      label: undefined,
    };
  const variant = product.variants.find((item) => item.id === variantId && item.isActive);
  if (!variant) return undefined;
  return {
    price: variant.price,
    costPrice: variant.costPrice ?? null,
    stock: inventoryValues(variant).available,
    trackInventory: inventoryValues(variant).tracked,
    label: Object.values(variant.attributeValues).join(" / "),
  };
}

export function createOrderLines(
  values: { productId: string; variantId: string; quantity: number }[],
  products: Product[],
): OrderLine[] {
  return values.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    const selection = selectedProduct(product, line.variantId);
    if (!product || !selection) return [];
    return [
      {
        productId: product.id,
        variantId: product.type === "variable" ? line.variantId : undefined,
        name: product.name,
        variantLabel: selection.label,
        quantity: Number.isFinite(line.quantity) && line.quantity > 0 ? line.quantity : 0,
        unitPrice: selection.price,
        unitCostSnapshot: selection.costPrice,
        adjustments: { discount: 0, refund: 0 },
      },
    ];
  });
}

// Demo transitions only: payment and fulfillment remain consistent when moving cards.
export function paymentForStatus(status: OrderStatus): PaymentStatus {
  return status === "pending_payment" ? "pending" : "paid";
}

export function normalizePhone(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[\s-]/g, "");
}
