// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider, createTranslator, createFormatter } from "next-intl";
import en from "@/locales/en.json";
import fa from "@/locales/fa.json";
import { mockOrders } from "@/features/orders/data/mock-orders";
import type { OrdersState } from "@/features/orders/store/orders-store";
import { invoiceFromOrder } from "../../utils";
import { formatInvoiceAsText } from "../../format-invoice-as-text";
import { InvoiceDialog } from "../invoice-dialog/invoice-dialog";
import { PublicInvoice } from "../public-invoice/public-invoice";
const state = vi.hoisted(() => ({
  orders: [] as OrdersState["orders"],
  ready: true,
  storageAvailable: true,
  addInvoicePaymentDetails: vi.fn(),
  sendInvoice: vi.fn(),
}));
vi.mock("@/features/orders/components/orders-provider/orders-provider", () => ({
  useOrdersStore: (selector: (value: typeof state) => unknown) => selector(state),
}));
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
vi.mock("../invoice-editor/invoice-editor", () => ({ InvoiceEditor: () => null }));
vi.mock("../invoice-share/invoice-share", () => ({ InvoiceShare: () => null }));
vi.mock("../invoice-copy-text/invoice-copy-text", () => ({ InvoiceCopyText: () => null }));
vi.mock("@/components/shared", () => ({
  DataTable: () => null,
  ActionFeedback: ({ message }: { message: string }) => <p role="status">{message}</p>,
  AppState: () => null,
  ContentSkeleton: () => null,
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
for (const locale of ["en", "fa"] as const)
  for (const view of ["dashboard", "public"] as const) {
    it.each([
      { cardNumber: "0012345678901234", accountNumber: "" },
      { cardNumber: "", accountNumber: "000123" },
      { cardNumber: "0012345678901234", accountNumber: "000123" },
    ])(locale + " " + view + " renders and copies enabled identifiers %j", (identifiers) => {
      const bank = { enabled: true, accountHolder: "Bank holder", ...identifiers };
      const order = structuredClone(mockOrders[0]);
      order.invoice.settingsSnapshot.paymentInformation = bank;
      state.orders = [order];
      const messages = locale === "fa" ? fa : en;
      render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          {view === "dashboard" ? (
            <InvoiceDialog orderId={order.id} onClose={() => {}} />
          ) : (
            <PublicInvoice token={order.invoice.publicToken} />
          )}
        </NextIntlClientProvider>,
      );
      expect(screen.getByText(bank.accountHolder)).toBeDefined();
      const t = createTranslator({ locale, messages, namespace: "invoices" });
      const text = formatInvoiceAsText(invoiceFromOrder(order), {
        locale,
        translate: t,
        number: createFormatter({ locale }).number,
      });
      for (const key of ["cardNumber", "accountNumber"] as const) {
        if (bank[key]) {
          expect(screen.getByText(bank[key]).getAttribute("dir")).toBe("ltr");
          expect(text).toContain(bank[key]);
        } else {
          expect(screen.queryByText(t(key))).toBeNull();
          expect(text).not.toContain(t(key) + ":");
        }
      }
      if (view === "public") {
        const print = vi.spyOn(window, "print").mockImplementation(() => {});
        fireEvent.click(screen.getByRole("button", { name: t("print") }));
        expect(print).toHaveBeenCalledOnce();
      }
    });
  }
it.each([
  undefined,
  {
    enabled: false,
    accountHolder: "Hidden holder",
    cardNumber: "0012345678901234",
    accountNumber: "000123",
  },
])("keeps absent/disabled bank details off the public document", (bank) => {
  const order = structuredClone(mockOrders[0]);
  order.invoice.settingsSnapshot.paymentInformation = bank;
  state.orders = [order];
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <PublicInvoice token={order.invoice.publicToken} />
    </NextIntlClientProvider>,
  );
  expect(screen.queryByRole("region", { name: en.invoices.paymentInformation })).toBeNull();
  expect(screen.queryByText("Hidden holder")).toBeNull();
});
it("offers an explicit legacy amendment in the dashboard only", () => {
  const order = structuredClone(mockOrders[0]);
  state.orders = [order];
  state.addInvoicePaymentDetails.mockReturnValue(true);
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <InvoiceDialog orderId={order.id} onClose={() => {}} />
    </NextIntlClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: en.invoices.addPaymentDetails }));
  expect(state.addInvoicePaymentDetails).toHaveBeenCalledWith(order.id);
  expect(screen.getByText(en.invoices.paymentDetailsAdded)).toBeDefined();
});
