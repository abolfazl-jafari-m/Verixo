import type { DateTimeFormatOptions } from "next-intl";
import type { Order } from "@/features/orders/types";
import { normalizePhone, orderTotals } from "@/features/orders/utils";
import type { Customer, CustomerOverview } from "./types";

// Local mock relationship only. A backend customer ID should replace this when
// customer accounts exist. Never merge customers by their display names.
export function customerIdentity(phone: string) {
  const normalized = normalizePhone(phone).replace(/^(?:\+98|0098|98)/, "0");
  return `customer:${normalized.startsWith("9") ? `0${normalized}` : normalized}`;
}

export function customerOverviews(orders: Order[], contacts: Customer[]): CustomerOverview[] {
  const groups = new Map<string, { customer: Customer; orders: Order[] }>();
  contacts.forEach((customer) => groups.set(customer.id, { customer, orders: [] }));
  // The latest submitted order supplies the displayed contact/address snapshot.
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  sorted.forEach((order) => {
    if (order.customerInformationStatus !== "submitted" || !order.customer) return;
    const id = customerIdentity(order.customer.phone);
    let group = groups.get(id);
    if (!group) {
      group = { customer: { ...order.customer, id }, orders: [] };
      groups.set(id, group);
    }
    if (!group.orders.length) group.customer = { ...order.customer, id };
    group.orders.push(order);
  });
  return [...groups.values()]
    .map(({ customer, orders: history }) => ({
      customer,
      orders: history,
      totalSpent: history
        .filter((order) => order.payment === "paid")
        .reduce(
          (total, order) =>
            total + orderTotals(order.lines, order.shipping, order.discountPercentage).total,
          0,
        ),
      deliveredCount: history.filter(
        (order) => order.payment === "paid" && order.status === "delivered",
      ).length,
      firstOrderAt: history.at(-1)?.createdAt ?? null,
      lastOrderAt: history[0]?.createdAt ?? null,
    }))
    .sort(
      (a, b) =>
        (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? "") ||
        a.customer.name.localeCompare(b.customer.name, "fa"),
    );
}

export function normalizeCustomerSearch(value: string) {
  return normalizePhone(value)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "")
    .toLocaleLowerCase();
}

export function customerDateOptions(locale: string) {
  return {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Tehran",
    calendar: locale === "fa" ? "persian" : "gregory",
  } satisfies DateTimeFormatOptions;
}
