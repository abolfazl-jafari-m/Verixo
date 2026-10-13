import type { DateTimeFormatOptions } from "next-intl";
import type { Order } from "@/features/orders/types";
import { getPathname } from "@/lib/i18n/navigations";
import { mockInvoiceSettings } from "./data/mock-invoice-settings";
import type { Invoice, InvoiceRecord, InvoiceSettings } from "./types";

export function createMockInvoice(
  order: Pick<Order, "id" | "number" | "createdAt">,
  settings: InvoiceSettings = mockInvoiceSettings,
): InvoiceRecord {
  return {
    id: `invoice:${order.id}`,
    orderId: order.id,
    number: order.number.replace(/^ORD-/, "INV-"),
    createdAt: order.createdAt,
    // Deterministic migration for old demo records; new order IDs are UUIDs.
    // Production must issue/validate public tokens on the server.
    publicToken: `mock-invoice-${order.id}`,
    // Freeze settings at issuance, including orders created as already paid.
    settingsSnapshot: structuredClone(settings),
  };
}

export function invoiceFromOrder(order: Order): Invoice {
  const customer = order.customerInformationStatus === "submitted" ? order.customer : null;
  return {
    ...order.invoice,
    orderNumber: order.number,
    lines: order.lines,
    shipping: order.shipping,
    customer: customer
      ? {
          name: customer.name,
          phone: customer.phone,
          city: customer.city,
          address: customer.address,
        }
      : null,
    payment: order.payment,
    // Payment is authoritative. Do not store a second, potentially stale paid flag.
    status: order.payment === "paid" ? "paid" : order.invoiceStatus === "sent" ? "sent" : "issued",
  };
}

export function invoicePath(token: string, locale: string) {
  return getPathname({
    locale: locale === "en" ? "en" : "fa",
    href: `/invoice/${encodeURIComponent(token)}`,
  });
}

export function invoiceDateOptions(locale: string) {
  return {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Tehran",
    calendar: locale === "fa" ? "persian" : "gregory",
  } satisfies DateTimeFormatOptions;
}

export const invoiceStatusStyles = {
  issued: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  sent: "bg-primary/10 text-primary-700 dark:text-primary-300",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};
