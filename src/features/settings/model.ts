import { z } from "zod";
import { mockInvoiceSettings } from "@/features/invoices/data/mock-invoice-settings";
import type { InvoiceSettings } from "@/features/invoices/types";
import { emptySender, senderSchema, type SenderSettings } from "@/features/shipping-labels/model";

import {
  configuredPaymentInformation,
  emptyPaymentInformation,
  bankInformationSchema,
} from "@/features/invoices/payment-information";

const text = z.string().trim().max(1000, "tooLong");
const localized = z.object({ fa: text, en: text });
const optionalPhone = z
  .string()
  .trim()
  .refine((value) => !value || senderSchema.shape.senderPhone.safeParse(value).success, "phone");
const optionalAddress = z
  .string()
  .trim()
  .max(500, "tooLong")
  .refine(
    (value) => !value || senderSchema.shape.senderAddress.safeParse(value).success,
    "address",
  );
export const settingsSchemas = {
  shop: z.object({
    name: z.object({
      fa: z.string().trim().min(2, "required").max(100, "tooLong"),
      en: z.string().trim().min(2, "required").max(100, "tooLong"),
    }),
    logo: senderSchema.shape.logo,
    phone: optionalPhone,
    address: optionalAddress,
    postalCode: senderSchema.shape.senderPostalCode,
  }),
  invoices: z.object({
    introduction: localized,
    footer: localized,
    paymentInformation: bankInformationSchema.default(emptyPaymentInformation),
  }),
  shipping: z
    .object({
      senderName: senderSchema.shape.senderName,
      useShopContact: z.boolean(),
      phone: z.string().trim().max(25, "tooLong"),
      address: z.string().trim().max(500, "tooLong"),
      postalCode: z.string().trim().max(15, "tooLong"),
      format: z.enum(["a6", "thermal"]),
    })
    .superRefine((value, ctx) => {
      if (!value.useShopContact) {
        if (!senderSchema.shape.senderPhone.safeParse(value.phone).success)
          ctx.addIssue({ code: "custom", path: ["phone"], message: "phone" });
        if (!senderSchema.shape.senderAddress.safeParse(value.address).success)
          ctx.addIssue({ code: "custom", path: ["address"], message: "address" });
        if (!senderSchema.shape.senderPostalCode.safeParse(value.postalCode).success)
          ctx.addIssue({ code: "custom", path: ["postalCode"], message: "postalCode" });
      }
    }),
  reports: z.object({
    period: z.enum(["today", "week", "month", "currentMonth", "previousMonth"]),
    compare: z.boolean(),
  }),
};
export type Settings = {
  [K in keyof typeof settingsSchemas]: z.infer<(typeof settingsSchemas)[K]>;
};
export type SettingsSection = keyof Settings;
export const defaultSettings: Settings = {
  shop: {
    name: { ...mockInvoiceSettings.shopName },
    logo: "",
    phone: "",
    address: "",
    postalCode: "",
  },
  invoices: {
    paymentInformation: { ...emptyPaymentInformation },
    introduction: { ...mockInvoiceSettings.introduction },
    footer: { ...mockInvoiceSettings.footer },
  },
  shipping: {
    senderName: "",
    useShopContact: true,
    phone: "",
    address: "",
    postalCode: "",
    format: "a6",
  },
  reports: { period: "month", compare: true },
};
// Historical invoices never call this selector. Only issuance captures these values.
export function invoiceSettingsSnapshot(
  shop: Settings["shop"],
  invoices: Settings["invoices"],
): InvoiceSettings {
  return structuredClone({
    template: "standard",
    shopName: shop.name,
    logo: shop.logo || undefined,
    contact: [shop.phone, shop.address, shop.postalCode].filter(Boolean).join("\n"),
    ...invoices,
    paymentInformation: configuredPaymentInformation(invoices.paymentInformation),
  });
}
export function resolveSender(
  shop: Settings["shop"],
  shipping: Settings["shipping"],
  locale: string,
): SenderSettings {
  const contact = shipping.useShopContact ? shop : shipping;
  return {
    ...emptySender,
    shopName: shop.name[locale === "fa" ? "fa" : "en"],
    logo: shop.logo,
    senderName: shipping.senderName,
    senderPhone: contact.phone,
    senderAddress: contact.address,
    senderPostalCode: contact.postalCode,
  };
}
export function migrateLegacySender(value: unknown): Pick<Settings, "shop" | "shipping"> | null {
  const parsed = senderSchema.safeParse(value);
  if (!parsed.success) return null;
  const sender = parsed.data;
  return {
    shop: {
      name: { fa: sender.shopName, en: sender.shopName },
      logo: sender.logo,
      phone: sender.senderPhone,
      address: sender.senderAddress,
      postalCode: sender.senderPostalCode,
    },
    shipping: { ...defaultSettings.shipping, senderName: sender.senderName },
  };
}
