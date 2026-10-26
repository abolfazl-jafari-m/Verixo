import { expect, it } from "vitest";
import {
  configuredPaymentInformation,
  invoiceShowsPaymentDetails,
  visiblePaymentInformation,
} from "./payment-information";
import { defaultSettings, invoiceSettingsSnapshot } from "@/features/settings/model";
const bank = { enabled: false, accountHolder: "Holder", cardNumber: "", accountNumber: "000123" };
it("recognizes valid bank information without requiring the old global switch", () => {
  expect(configuredPaymentInformation(bank)).toMatchObject({ accountNumber: "000123" });
  expect(
    invoiceSettingsSnapshot(defaultSettings.shop, {
      ...defaultSettings.invoices,
      paymentInformation: bank,
    }).paymentInformation,
  ).toMatchObject({ enabled: true, accountNumber: "000123" });
});
it("distinguishes explicit false, explicit true, and legacy visibility", () => {
  expect(visiblePaymentInformation(bank, true)).toBeDefined();
  expect(visiblePaymentInformation({ ...bank, enabled: true }, false)).toBeUndefined();
  expect(visiblePaymentInformation(bank)).toBeUndefined();
  expect(visiblePaymentInformation({ ...bank, enabled: true })).toBeDefined();
  expect(invoiceShowsPaymentDetails(undefined)).toBe(true);
  expect(visiblePaymentInformation(undefined, true)).toBeUndefined();
  expect(visiblePaymentInformation({ ...bank, accountNumber: "" }, true)).toBeUndefined();
  expect(visiblePaymentInformation({ ...bank, accountHolder: "" }, true)).toBeUndefined();
});
