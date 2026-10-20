import { mockOrders } from "@/features/orders/data/mock-orders";
import type { Order } from "@/features/orders/types";
import type { ReportSource } from "../types";

// Adjustment records only; acquisition costs live on historical order lines.
const lines = mockOrders.flatMap((order) =>
  order.lines.map((line, lineIndex) => ({
    orderId: order.id,
    lineIndex,
    discount: 0,
    refund: 0,
  })),
);
const payments = [
  {
    id: "demo-receipt-1",
    orderId: "demo-order-1",
    amount: 840000,
    confirmedAt: "2026-10-12T10:00:00+03:30",
  },
  {
    id: "demo-receipt-2",
    orderId: "demo-order-2",
    amount: 1250000,
    confirmedAt: "2026-10-11T10:00:00+03:30",
  },
];
export function demoReportSource(orders: Order[]): ReportSource {
  return {
    orders,
    // New order creation explicitly records zero adjustments; do not infer them for legacy orders.
    lines: [
      ...orders.flatMap((order) =>
        order.lines.flatMap((line, lineIndex) =>
          line.adjustments ? [{ orderId: order.id, lineIndex, ...line.adjustments }] : [],
        ),
      ),
      ...lines.filter((fact) => {
        const original = mockOrders.find((order) => order.id === fact.orderId)?.lines[
          fact.lineIndex
        ];
        const current = orders.find((order) => order.id === fact.orderId)?.lines[fact.lineIndex];
        return (
          original &&
          current &&
          !current.adjustments &&
          original.productId === current.productId &&
          original.variantId === current.variantId &&
          original.quantity === current.quantity &&
          original.unitPrice === current.unitPrice
        );
      }),
    ],
    payments: payments.filter((payment) => orders.some((order) => order.id === payment.orderId)),
    expenses: [
      {
        id: "demo-packaging-1",
        title: "",
        amount: 180000,
        category: "packaging",
        occurredAt: "2026-10-10T09:00:00+03:30",
      },
    ],
    cancellations: orders.flatMap((order) =>
      order.cancelledAt ? [{ orderId: order.id, cancelledAt: order.cancelledAt }] : [],
    ),
    completeness: { payments: false, expenses: false, cancellations: false },
  };
}
