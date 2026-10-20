import { createMockInvoice } from "@/features/invoices/utils";
import { fulfillmentStatuses, type Order } from "../types";
import { paymentForStatus } from "../utils";

const customers = [
  "سارا احمدی",
  "علی رضایی",
  "نگار محمدی",
  "مریم کریمی",
  "امیر حسینی",
  "زهرا موسوی",
  "رضا نادری",
  "الهام رحیمی",
  "نیما صادقی",
  "پریسا مرادی",
  "آرمان شریفی",
  "سمیرا کاظمی",
];
// Costs below are the previously recorded demo-ledger snapshots, not current-catalog lookups.
export const mockOrders: Order[] = customers.map((name, index) => {
  const status = fulfillmentStatuses[index % fulfillmentStatuses.length];
  return {
    archivedAt: null,
    id: `demo-order-${index}`,
    number: `ORD-${1042 + index}`,
    customerInformationStatus:
      status === "pending_payment" || status === "paid" ? "pending" : "submitted",
    shippingMethod: status === "pending_payment" || status === "paid" ? null : "post",
    customerFormToken: status === "pending_payment" ? null : `mock-example-${index}-customer-form`,
    customer:
      status === "pending_payment" || status === "paid"
        ? null
        : {
            province: "تهران",
            city: "تهران",
            postalCode: "1234567890",
            deliveryNotes: "",
            name,
            phone: `091212345${String(index).padStart(2, "0")}`,
            address: "تهران، خیابان ولیعصر، کوچه بهار، پلاک ۱۲",
          },
    notes: index === 0 ? "لطفاً بسته‌بندی هدیه داشته باشد." : "",
    status,
    payment: paymentForStatus(status),
    invoiceStatus: "not_sent",
    invoice: createMockInvoice({
      id: `demo-order-${index}`,
      number: `ORD-${1042 + index}`,
      createdAt: `2026-10-${String(11 - Math.floor(index / 2)).padStart(2, "0")}T09:30:00.000Z`,
    }),
    shipping: 60000,
    createdAt: `2026-10-${String(11 - Math.floor(index / 2)).padStart(2, "0")}T09:30:00.000Z`,
    lines:
      index % 2 === 0
        ? [
            {
              productId: "order-shirt",
              variantId: "shirt-black-m",
              name: "تیشرت نخی کلاسیک",
              variantLabel: "مشکی / M",
              quantity: 1,
              unitPrice: 620000,
              unitCostSnapshot: 360000,
            },
            {
              productId: "order-mug",
              name: "ماگ سرامیکی دست‌ساز",
              quantity: 2,
              unitPrice: 285000,
              unitCostSnapshot: 150000,
            },
          ]
        : [
            {
              productId: "order-bag",
              name: "کیف پارچه‌ای آفتاب",
              quantity: 1 + (index % 3),
              unitPrice: 390000,
              unitCostSnapshot: null,
            },
          ],
  };
});
