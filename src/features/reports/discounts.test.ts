import { expect, it } from "vitest";
import { buildReport } from "./calculations";
import { demoReportSource } from "./data/demo-ledger";
import { mockOrders } from "@/features/orders/data/mock-orders";
import { invoiceFromOrder } from "@/features/invoices/utils";
import { orderTotals } from "@/features/orders/utils";
import { vi } from "vitest";
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
it("keeps gross sales, deducts percentage once, and uses discounted revenue for profit", () => {
  const order = {
    ...mockOrders[0],
    id: "discounted",
    payment: "paid" as const,
    status: "paid" as const,
    discountPercentage: 10,
    shipping: 100000,
    lines: [
      {
        productId: "p",
        name: "Shirt",
        variantId: "blue",
        quantity: 2,
        unitPrice: 1000000,
        unitCostSnapshot: 400000,
        adjustments: { discount: 0, refund: 0 },
      },
      {
        productId: "p",
        name: "Shirt",
        variantId: "red",
        quantity: 1,
        unitPrice: 500000,
        unitCostSnapshot: 100000,
        adjustments: { discount: 0, refund: 0 },
      },
    ],
  };
  const source = demoReportSource([order]);
  source.expenses = [];
  source.completeness.expenses = true;
  const report = buildReport(source, { from: "2026-10-01", to: "2026-10-31" });
  expect(report.metrics).toMatchObject({
    gross: 2500000,
    discounts: 250000,
    net: 2250000,
    cost: 900000,
    grossProfit: 1350000,
    profit: 1350000,
  });
  expect(report.products).toHaveLength(1);
  expect(report.products[0]).toMatchObject({ gross: 2500000, discounts: 250000, quantity: 3 });
  const invoice = invoiceFromOrder(order);
  expect(report.metrics.net + order.shipping).toBe(
    orderTotals(invoice.lines, invoice.shipping, invoice.discountPercentage).total,
  );
  expect(order.lines[0].adjustments.discount).toBe(0);
  // Legacy line adjustments are additional facts, not a second copy of the percentage.
  source.lines[0].discount = 10;
  source.lines[0].refund = 20;
  expect(buildReport(source, report.range).metrics).toMatchObject({
    discounts: 250010,
    refunds: 20,
    net: 2249970,
  });
});
it("leaves historical reports without an order percentage unchanged", () => {
  const source = demoReportSource(mockOrders);
  const range = { from: "2026-10-01", to: "2026-10-31" };
  expect(buildReport(source, range)).toEqual(
    buildReport(
      { ...source, orders: mockOrders.map((order) => ({ ...order, discountPercentage: 0 })) },
      range,
    ),
  );
});
