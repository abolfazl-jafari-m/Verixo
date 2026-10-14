import type { InvoiceRecord } from "@/features/invoices/types";

export const orderStatuses = [
  "pending_payment",
  "paid",
  "packaged",
  "courier",
  "delivered",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export type InvoiceDeliveryStatus = "not_sent" | "sent";
export type PaymentStatus = "pending" | "paid";

export const shippingMethods = ["tipax", "post", "courier"] as const;
export type ShippingMethod = (typeof shippingMethods)[number];
export interface CustomerInformation {
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  deliveryNotes: string;
}
export type CreateOrderValues = Pick<Order, "lines" | "notes" | "shipping" | "payment">;

export interface OrderLineAdjustments {
  discount: number;
  refund: number;
}

export interface OrderLine {
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  // Captured with unitPrice at submission, never refreshed on payment or product edits.
  readonly unitCostSnapshot?: number | null;
  // New orders explicitly start with no adjustments; absent legacy records stay unknown.
  adjustments?: OrderLineAdjustments;
}

export interface Order {
  archivedAt: string | null;
  id: string;
  number: string;
  customer: CustomerInformation | null;
  customerInformationStatus: "pending" | "submitted";
  shippingMethod: ShippingMethod | null;
  customerFormToken: string | null;
  notes: string;
  lines: OrderLine[];
  shipping: number;
  payment: PaymentStatus;
  invoiceStatus: InvoiceDeliveryStatus;
  invoice: InvoiceRecord;
  status: OrderStatus;
  createdAt: string;
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return orderStatuses.some((status) => status === value);
}
