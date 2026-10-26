import { orderTotals } from "@/features/orders/utils";
import { visiblePaymentInformation } from "./payment-information";
import type { Invoice } from "./types";

type TextLabel =
  | "invoice"
  | "customer"
  | "items"
  | "quantity"
  | "unitPrice"
  | "lineTotal"
  | "subtotal"
  | "discount"
  | "shipping"
  | "total"
  | "currency"
  | "paymentInformation"
  | "paymentInstructions"
  | "accountHolder"
  | "cardNumber"
  | "accountNumber";
export interface InvoiceTextOptions {
  locale: string;
  translate: (key: TextLabel) => string;
  number: (value: number) => string;
}
// Explicitly whitelist public fields; never include order notes, cost snapshots or tokens.
export function formatInvoiceAsText(
  invoice: Invoice,
  { locale, translate: t, number }: InvoiceTextOptions,
): string {
  const language = locale === "fa" ? "fa" : "en";
  const settings = invoice.settingsSnapshot;
  const totals = orderTotals(invoice.lines, invoice.shipping, invoice.discountPercentage);
  const money = (value: number) => number(value) + " " + t("currency");
  const lines = [settings.shopName[language], t("invoice") + ": " + invoice.number];
  if (invoice.customer?.name) lines.push(t("customer") + ": " + invoice.customer.name);
  if (settings.introduction[language]) lines.push("", settings.introduction[language]);
  lines.push("", t("items"));
  for (const line of invoice.lines) {
    lines.push(
      line.name + (line.variantLabel ? " — " + line.variantLabel : ""),
      t("quantity") +
        ": " +
        number(line.quantity) +
        " | " +
        t("unitPrice") +
        ": " +
        money(line.unitPrice),
      t("lineTotal") + ": " + money(orderTotals([line], 0).subtotal),
      "",
    );
  }
  lines.push(t("subtotal") + ": " + money(totals.subtotal));
  if (totals.discountPercentage > 0)
    lines.push(
      t("discount") +
        " (" +
        number(totals.discountPercentage) +
        "%): " +
        money(-totals.discountAmount),
    );
  if (invoice.shipping) lines.push(t("shipping") + ": " + money(invoice.shipping));
  lines.push(t("total") + ": " + money(totals.total));
  const bank = visiblePaymentInformation(settings.paymentInformation, invoice.showPaymentDetails);
  if (bank) {
    lines.push(
      "",
      t("paymentInformation"),
      t("paymentInstructions"),
      t("accountHolder") + ": " + bank.accountHolder,
    );
    if (bank.cardNumber) lines.push(t("cardNumber") + ": " + bank.cardNumber);
    if (bank.accountNumber) lines.push(t("accountNumber") + ": " + bank.accountNumber);
  }
  if (settings.footer[language]) lines.push("", settings.footer[language]);
  return lines.join("\n");
}
