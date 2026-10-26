import type { CustomerInformation, OrderLine, PaymentStatus } from "@/features/orders/types";

import type { PaymentInformation } from "./payment-information";

export type InvoiceText = Record<"fa" | "en", string>;
export interface InvoiceSettings {
  paymentInformation?: PaymentInformation;
  template: "standard";
  shopName: InvoiceText;
  contact: string;
  logo?: string;
  introduction: InvoiceText;
  footer: InvoiceText;
}

// Stored with its order so edits and payment confirmation remain atomic locally.
export interface InvoiceRecord {
  // Optional only for legacy records; new invoices explicitly capture both fields.
  showPaymentDetails?: boolean;
  discountPercentage?: number;
  id: string;
  orderId: string;
  number: string;
  createdAt: string;
  publicToken: string;
  settingsSnapshot: InvoiceSettings;
}

export const invoiceStatuses = ["issued", "sent", "paid"] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];
export interface Invoice extends InvoiceRecord {
  orderNumber: string;
  lines: OrderLine[];
  shipping: number;
  customer: Pick<CustomerInformation, "name" | "phone" | "city" | "address"> | null;
  payment: PaymentStatus;
  status: InvoiceStatus;
}
