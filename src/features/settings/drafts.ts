import { createPersistedRecord } from "@/lib/storage/persisted-record";
import { z } from "zod";
import { settingsSchemas, type Settings, type SettingsSection } from "./model";
import {
  paymentInformationFields,
  emptyPaymentInformation,
} from "@/features/invoices/payment-information";
const short = z.string().max(100);
const draftSchemas = {
  shop: settingsSchemas.shop.extend({
    name: z.object({ fa: short, en: short }),
    phone: z.string().max(25),
    address: z.string().max(500),
    postalCode: z.string().max(15),
  }),
  invoices: settingsSchemas.invoices.extend({
    paymentInformation: paymentInformationFields.default(emptyPaymentInformation),
  }),
  shipping: z.object({
    senderName: short,
    useShopContact: z.boolean(),
    phone: z.string().max(25),
    address: z.string().max(500),
    postalCode: z.string().max(15),
    format: z.enum(["a6", "thermal"]),
  }),
  reports: settingsSchemas.reports,
};

export function createSettingsDraftStore<K extends SettingsSection>(section: K) {
  return createPersistedRecord<Settings[K] | null>({
    name: "verixo:settings-draft:v2:" + section,
    initial: null,
    storage: () => window.sessionStorage,
    parse: (value) => (value === null ? null : (draftSchemas[section].parse(value) as Settings[K])),
    legacy(storage) {
      const key = "verixo:settings-draft:v1:" + section;
      const raw = storage.getItem(key);
      return raw === null ? null : { value: JSON.parse(raw), keys: [key] };
    },
  });
}
export function readSettingsDraft<K extends SettingsSection>(section: K): Settings[K] | null {
  try {
    return createSettingsDraftStore(section).read().value;
  } catch {
    return null;
  }
}
export function keepSettingsDraft<K extends SettingsSection>(
  section: K,
  value: Settings[K] | null,
) {
  try {
    createSettingsDraftStore(section).save(value);
  } catch {
    /* Recovery is best effort; explicit saves report errors. */
  }
}
