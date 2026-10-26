import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryStorage } from "@/lib/storage/__tests__/memory-storage";
import {
  emptyPaymentInformation,
  normalizePaymentIdentifier,
  paymentInformationSchema,
} from "@/features/invoices/payment-information";
import { defaultSettings, settingsSchemas } from "./model";
import { createSettingsStore } from "./store/settings-store";
import { createSettingsDraftStore } from "./drafts";
beforeEach(() =>
  vi.stubGlobal("window", {
    localStorage: new MemoryStorage(),
    sessionStorage: new MemoryStorage(),
  }),
);
afterEach(() => vi.unstubAllGlobals());
it("normalizes Persian and Arabic digits and separators without dropping leading zeros", () => {
  expect(normalizePaymentIdentifier("۰۰۱۲-٣٤٥٦ ۷۸۹۰۱۲۳۴")).toBe("0012345678901234");
  expect(
    paymentInformationSchema.parse({
      ...emptyPaymentInformation,
      enabled: true,
      accountHolder: " Owner ",
      accountNumber: "۰۰۰١٢٣",
    }),
  ).toMatchObject({ accountHolder: "Owner", accountNumber: "000123" });
});
it("requires a holder and identifier only when enabled, validates supplied identifiers", () => {
  expect(paymentInformationSchema.safeParse(emptyPaymentInformation).success).toBe(true);
  expect(
    paymentInformationSchema.safeParse({ ...emptyPaymentInformation, enabled: true }).success,
  ).toBe(false);
  expect(
    paymentInformationSchema.safeParse({
      ...emptyPaymentInformation,
      enabled: true,
      accountHolder: "Owner",
    }).success,
  ).toBe(false);
  for (const cardNumber of ["123", "12345678901234567", "123456789012345x"])
    expect(
      paymentInformationSchema.safeParse({ ...emptyPaymentInformation, cardNumber }).success,
    ).toBe(false);
  expect(
    paymentInformationSchema.safeParse({ ...emptyPaymentInformation, accountNumber: "12abc" })
      .success,
  ).toBe(false);
  expect(
    paymentInformationSchema.safeParse({
      ...emptyPaymentInformation,
      enabled: true,
      accountHolder: "Owner",
      cardNumber: "0012-3456-7890-1234",
    }).success,
  ).toBe(true);
});
it("loads legacy settings with disabled defaults and persists normalized identifiers when disabled", () => {
  const { introduction, footer } = defaultSettings.invoices;
  window.localStorage.setItem(
    "verixo:settings:v1:invoices",
    JSON.stringify({ introduction, footer }),
  );
  expect(createSettingsStore("invoices").read().value.paymentInformation).toEqual(
    emptyPaymentInformation,
  );
  const value = settingsSchemas.invoices.parse({
    introduction,
    footer,
    paymentInformation: {
      ...emptyPaymentInformation,
      accountHolder: "Owner",
      cardNumber: "۰۰۱۲-٣٤٥٦-۷۸۹۰-۱۲۳۴",
      accountNumber: "000123",
    },
  });
  createSettingsStore("invoices").save(value);
  expect(createSettingsStore("invoices").read().value.paymentInformation).toEqual({
    enabled: false,
    accountHolder: "Owner",
    cardNumber: "0012345678901234",
    accountNumber: "000123",
  });
});
it("recovers unfinished enabled drafts without saving them as payment settings", () => {
  const draft = {
    ...defaultSettings.invoices,
    paymentInformation: { ...emptyPaymentInformation, enabled: true, cardNumber: "۱۲" },
  };
  createSettingsDraftStore("invoices").save(draft);
  expect(createSettingsDraftStore("invoices").read().value).toEqual(draft);
  expect(createSettingsStore("invoices").read().value.paymentInformation.enabled).toBe(false);
  expect(() => createSettingsStore("invoices").save(draft)).toThrow();
});

it("can clear bank fields previously enabled globally, without a global switch", () => {
  const value = {
    ...defaultSettings.invoices,
    paymentInformation: { ...emptyPaymentInformation, enabled: true },
  };
  createSettingsStore("invoices").save(value);
  expect(createSettingsStore("invoices").read().value.paymentInformation.accountHolder).toBe("");
  expect(
    settingsSchemas.invoices.safeParse({
      ...value,
      paymentInformation: {
        ...value.paymentInformation,
        enabled: false,
        cardNumber: "0012345678901234",
      },
    }).success,
  ).toBe(false);
});
