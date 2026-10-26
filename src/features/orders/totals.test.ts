import { expect, it } from "vitest";
import { orderTotals, allocateOrderDiscount } from "./totals";
import { discountPercentageSchema } from "./schemas/discount-schema";
import { createOrderFormSchema } from "./schemas/order-schema";
import { invoiceEditSchema } from "@/features/invoices/schemas/invoice-schema";
const line = (unitPrice: number, quantity = 1) => ({
  productId: "p",
  name: "Product",
  unitPrice,
  quantity,
});
it("defaults to zero and discounts products without changing shipping or prices", () => {
  const lines = [line(1000000, 2), line(500000)];
  expect(orderTotals(lines, 100000).total).toBe(2600000);
  expect(orderTotals(lines, 100000, 10)).toMatchObject({
    subtotal: 2500000,
    discountAmount: 250000,
    discountedSubtotal: 2250000,
    total: 2350000,
  });
  expect(orderTotals(lines, 100000, 100).total).toBe(100000);
  expect(lines[0].unitPrice).toBe(1000000);
  expect(orderTotals([], 100, 100)).toMatchObject({ total: 100, discountAmount: 0 });
});
it("rounds half up in whole toman using exact basis points", () => {
  expect(orderTotals([line(5000)], 0, 0.29).discountAmount).toBe(15);
  expect(orderTotals([line(101)], 10, 12.5)).toMatchObject({ discountAmount: 13, total: 98 });
  expect(orderTotals([line(1)], 0, 50).discountAmount).toBe(1);
  expect(orderTotals([line(1)], 0, 49.99).discountAmount).toBe(0);
  expect(orderTotals([line(90071992547409)], 0, 12.5).discountAmount).toBe(11258999068426);
});
it("allocates a rounded discount once across multiple products and variants", () => {
  const lines = [line(1), line(1), line(1)];
  const shares = allocateOrderDiscount(lines, 50);
  expect(shares).toEqual([1, 0, 1]);
  expect(shares.reduce((sum, amount) => sum + amount, 0)).toBe(
    orderTotals(lines, 0, 50).discountAmount,
  );
  expect(allocateOrderDiscount([line(0.6), line(0.6)], 100)).toEqual([0.5, 0.5]);
});
it.each([0, 100, 0.29, 12.5, 99.99])("accepts percentage %s", (percentage) => {
  expect(discountPercentageSchema.parse(percentage)).toBe(percentage);
});
it.each([-1, 100.01, Infinity, -Infinity, NaN, 0.001])(
  "rejects invalid percentage %s at both form boundaries",
  (percentage) => {
    expect(discountPercentageSchema.safeParse(percentage).success).toBe(false);
    expect(
      invoiceEditSchema.safeParse({
        unitPrices: [{ value: 100 }],
        shipping: 0,
        discountPercentage: percentage,
      }).success,
    ).toBe(false);
    const parsed = createOrderFormSchema([]).safeParse({
      notes: "",
      shipping: 0,
      payment: "pending",
      lines: [],
      discountPercentage: percentage,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.path[0] === "discountPercentage")).toBe(
        true,
      );
  },
);
