import type { InvoiceSettings } from "../types";

// Historical demo seed and initial settings defaults. Existing fixtures/legacy
// records must not acquire today's branding when their invoice is reconstructed.
export const mockInvoiceSettings: InvoiceSettings = {
  template: "standard",
  shopName: { fa: "فروشگاه مد پارسی", en: "Parsi Fashion" },
  contact: "",
  introduction: {
    fa: "جزئیات سفارش شما در این فاکتور ثبت شده است.",
    en: "Your order details are listed below.",
  },
  footer: { fa: "از خرید شما سپاسگزاریم.", en: "Thank you for shopping with us." },
};
