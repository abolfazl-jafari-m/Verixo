import { expect, it, vi } from "vitest";
import { createTranslator, createFormatter } from "next-intl";
import en from "@/locales/en.json";
import fa from "@/locales/fa.json";
import { mockOrders } from "@/features/orders/data/mock-orders";
import { invoiceFromOrder, createMockInvoice } from "./utils";
import { defaultSettings, invoiceSettingsSnapshot } from "@/features/settings/model";
import { invoiceRecordSchema } from "./schemas/invoice-schema";
import { visiblePaymentInformation } from "./payment-information";
import { formatInvoiceAsText } from "./format-invoice-as-text";

const bank = {
  enabled: true,
  accountHolder: "Holder",
  cardNumber: "0012345678901234",
  accountNumber: "000123",
};
function fixture() {
  const invoice = invoiceFromOrder(mockOrders[0]);
  return {
    ...invoice,
    shipping: 50,
    customer: { name: "Customer", phone: "private phone", city: "", address: "private address" },
    settingsSnapshot: { ...invoice.settingsSnapshot, paymentInformation: { ...bank } },
    lines: [
      {
        productId: "private-product-id",
        name: "Shirt",
        variantLabel: "Blue / XL",
        quantity: 2,
        unitPrice: 100,
        unitCostSnapshot: 30,
      },
      { productId: "second-id", name: "Hat", quantity: 3, unitPrice: 25 },
    ],
  };
}
function options(locale: "en" | "fa") {
  return {
    locale,
    translate: createTranslator({
      locale,
      messages: locale === "fa" ? fa : en,
      namespace: "invoices",
    }),
    number: createFormatter({ locale }).number,
  };
}
it.each(["en", "fa"] as const)(
  "formats multiple lines, variants, shipping and canonical totals in %s",
  (locale) => {
    const invoice = fixture();
    const opts = options(locale);
    const text = formatInvoiceAsText(invoice, opts);
    expect(text).toContain("Shirt — Blue / XL");
    expect(text).toContain("Hat");
    for (const amount of [200, 75, 275, 50, 325])
      expect(text).toContain(opts.number(amount) + " " + opts.translate("currency"));
    expect(text).toContain(opts.translate("total") + ": " + opts.number(325));
    expect(text).toContain(bank.accountNumber);
    expect(text).toContain(bank.cardNumber);
    expect(text).toContain(invoice.settingsSnapshot.footer[locale]);
    for (const secret of [
      "private-product-id",
      "private phone",
      "private address",
      invoice.publicToken,
      "unitCostSnapshot",
    ])
      expect(text).not.toContain(secret);
  },
);
it("omits absent customer, zero shipping, optional bank fields and disabled payment information", () => {
  const invoice = fixture();
  const opts = options("en");
  const text = formatInvoiceAsText(
    {
      ...invoice,
      customer: null,
      shipping: 0,
      settingsSnapshot: {
        ...invoice.settingsSnapshot,
        introduction: { fa: "", en: "" },
        footer: { fa: "", en: "" },
        paymentInformation: undefined,
      },
    },
    opts,
  );
  expect(text).not.toContain(opts.translate("customer") + ":");
  expect(text).not.toContain(opts.translate("shipping") + ":");
  expect(text).not.toContain(opts.translate("paymentInformation"));
  expect(text).not.toContain("undefined");
  expect(visiblePaymentInformation({ ...bank, enabled: false })).toBeUndefined();
  expect(
    formatInvoiceAsText(
      {
        ...invoice,
        settingsSnapshot: {
          ...invoice.settingsSnapshot,
          paymentInformation: { ...bank, enabled: false },
        },
      },
      opts,
    ),
  ).not.toContain(bank.cardNumber);
  expect(
    formatInvoiceAsText(
      {
        ...invoice,
        settingsSnapshot: {
          ...invoice.settingsSnapshot,
          paymentInformation: { ...bank, cardNumber: "" },
        },
      },
      opts,
    ),
  ).not.toContain(opts.translate("cardNumber") + ":");
});
it("freezes payment information at issuance and round-trips snapshots without retrofitting old invoices", () => {
  const preferences = { ...defaultSettings.invoices, paymentInformation: { ...bank } };
  const snapshot = invoiceSettingsSnapshot(defaultSettings.shop, preferences);
  const record = createMockInvoice(mockOrders[0], snapshot);
  preferences.paymentInformation.accountNumber = "999";
  snapshot.paymentInformation!.accountHolder = "Changed";
  expect(record.settingsSnapshot.paymentInformation).toEqual(bank);
  expect(
    invoiceRecordSchema.parse(JSON.parse(JSON.stringify(record))).settingsSnapshot
      .paymentInformation,
  ).toEqual(bank);
  expect(createMockInvoice(mockOrders[0]).settingsSnapshot.paymentInformation).toBeUndefined();
});

vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));

it.each(["en", "fa"] as const)(
  "uses the invoice discount and per-invoice visibility in %s text",
  (locale) => {
    const invoice = { ...fixture(), discountPercentage: 12.5, showPaymentDetails: false };
    const opts = options(locale);
    const text = formatInvoiceAsText(invoice, opts);
    expect(text).toContain(
      opts.translate("discount") + " (" + opts.number(12.5) + "%): " + opts.number(-34),
    );
    expect(text).toContain(opts.translate("total") + ": " + opts.number(291));
    expect(text).not.toContain(bank.accountNumber);
    const shown = formatInvoiceAsText({ ...invoice, showPaymentDetails: true }, opts);
    expect(shown).toContain(bank.accountNumber);
  },
);
