import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { mockOrders } from "@/features/orders/data/mock-orders";
import {
  emptySender,
  formats,
  partitionOrders,
  recipientIssues,
  selectDisplayed,
  selectedOrders,
  senderSchema,
  toggleSelection,
  toLabel,
} from "./model";
import { buildLabelPdf, textDirection } from "./pdf";
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: () => "/test" }));

const order = mockOrders.find((item) => item.customer)!;
const sender = {
  ...emptySender,
  shopName: "فروشگاه وریکسو",
  senderName: "سارا محمدی",
  senderPhone: "۰۲۱۱۲۳۴۵۶۷۸",
  senderAddress: "تهران، خیابان ولیعصر، پلاک ۱۲",
};
const messages = {
  title: "برچسب ارسال",
  sender: "فرستنده",
  recipient: "گیرنده",
  phone: "تلفن",
  postalCode: "کد پستی",
  order: "سفارش",
};
const font = readFileSync("public/fonts/Vazirmatn-Regular.ttf").toString("base64");

describe("shipping label validation and selection", () => {
  it("requires recipient name, phone, city and address, but not postal code or province", () => {
    expect(recipientIssues(order)).toEqual([]);
    expect(
      recipientIssues({ ...order, customer: { ...order.customer!, postalCode: "", province: "" } }),
    ).toEqual([]);
    for (const field of ["name", "phone", "city", "address"] as const)
      expect(
        recipientIssues({ ...order, customer: { ...order.customer!, [field]: "" } }),
      ).toContain(field);
    expect(recipientIssues({ ...order, customer: null })).toHaveLength(4);
  });
  it("validates sender information independently and permits missing optional fields", () => {
    expect(senderSchema.safeParse(sender).success).toBe(true);
    expect(senderSchema.safeParse(emptySender).success).toBe(false);
    expect(senderSchema.safeParse({ ...sender, senderPhone: "bad" }).success).toBe(false);
    expect(senderSchema.safeParse({ ...sender, senderPostalCode: "123" }).success).toBe(false);
    expect(
      senderSchema.safeParse({ ...sender, logo: "https://example.com/logo.svg" }).success,
    ).toBe(false);
  });
  it("toggles selection and selects only displayed orders", () => {
    expect(toggleSelection(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleSelection(["a", "b"], "a")).toEqual(["b"]);
    expect(selectDisplayed([order], true)).toEqual([order.id]);
    expect(selectDisplayed([order], false)).toEqual([]);
    expect(selectedOrders([order], ["hidden", order.id, order.id])).toEqual([order]);
  });
  it("uses board order, excludes invalid recipients, never mutates orders", () => {
    const before = structuredClone(mockOrders);
    const selected = selectedOrders(mockOrders, mockOrders.map((item) => item.id).reverse());
    const { valid, invalid } = partitionOrders(selected);
    expect(valid.length).toBeGreaterThan(0);
    expect(invalid.length).toBeGreaterThan(0);
    expect(valid.every((item) => !!item.customer)).toBe(true);
    const labels = valid.map(toLabel);
    expect(new Set(labels.map((label) => label.id)).size).toBe(labels.length);
    expect(labels[0].id).toBe(valid[0].id);
    expect(labels[0]).not.toHaveProperty("payment");
    expect(labels[0]).not.toHaveProperty("lines");
    expect(mockOrders).toEqual(before);
  });
});
describe("real vector PDFs", () => {
  it.each(["a6", "thermal"] as const)(
    "generates one %s page per order with an embedded font",
    (format) => {
      const valid = partitionOrders(mockOrders).valid;
      const pdf = buildLabelPdf(valid.map(toLabel), sender, format, "fa", messages, font);
      expect(pdf.getNumberOfPages()).toBe(valid.length);
      expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(formats[format].width, 2);
      expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(formats[format].height, 2);
      const output = pdf.output();
      expect(output.startsWith("%PDF-")).toBe(true);
      expect(output).toContain("/FontFile2");
      expect(output).toContain("/ToUnicode");
    },
  );
  it("handles language direction, numbers and long names/addresses without adding pages", () => {
    expect(textDirection("09121234567")).toBe("ltr");
    expect(textDirection("تهران، پلاک 12")).toBe("rtl");
    expect(textDirection("London")).toBe("ltr");
    const label = toLabel(order);
    label.recipient.name = "نام بلند ".repeat(10);
    label.recipient.address = "تهران خیابان ولیعصر پلاک ۱۲ ".repeat(15);
    const pdf = buildLabelPdf([label], sender, "a6", "fa", messages, font);
    expect(pdf.getNumberOfPages()).toBe(1);
    expect(() => buildLabelPdf([], sender, "a6", "en", messages, font)).toThrow();
  });
});
