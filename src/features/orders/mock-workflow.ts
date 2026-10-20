import type { Order, OrderStatus } from "./types";
import { getPathname } from "@/lib/i18n/navigations";
import { routing } from "@/lib/i18n/routing";

// Prototype only. Production tokens must be issued and validated by the backend.
export function createMockCustomerToken() {
  return `mock-${crypto.randomUUID()}`;
}

export function customerFormPath(token: string, locale: string) {
  return getPathname({
    locale: locale === "en" ? "en" : routing.defaultLocale,
    href: `/order-information/${encodeURIComponent(token)}`,
  });
}

export function canMoveOrder(order: Order, status: OrderStatus) {
  if (order.status === "cancelled" || status === "cancelled") return false;
  if (
    (order.status === "courier" || order.status === "delivered") &&
    status !== "courier" &&
    status !== "delivered"
  )
    return false;
  if (order.inventory?.state === "exception" && status !== "paid" && status !== "pending_payment")
    return false;
  if (status === order.status) return true;
  if (status === "pending_payment") return order.payment === "pending";
  if (status === "paid") return true; // Existing confirmation action / drop into Paid.
  return order.payment === "paid" && order.customerInformationStatus === "submitted";
}

export function transitionOrder(order: Order, status: OrderStatus): Order {
  if (!canMoveOrder(order, status)) return order;
  if (status === "paid") {
    return {
      ...order,
      status,
      payment: "paid",
      customerFormToken: order.customerFormToken ?? createMockCustomerToken(),
    };
  }
  return { ...order, status };
}
