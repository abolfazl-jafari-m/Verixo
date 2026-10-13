import { z } from "zod";
import { settingsSchemas, type Settings, type SettingsSection } from "./model";
const short = z.string().max(100);
const draftSchemas = {
  shop: settingsSchemas.shop.extend({
    name: z.object({ fa: short, en: short }),
    phone: z.string().max(25),
    address: z.string().max(500),
    postalCode: z.string().max(15),
  }),
  invoices: settingsSchemas.invoices,
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
export function readSettingsDraft<K extends SettingsSection>(section: K): Settings[K] | null {
  try {
    const parsed = draftSchemas[section].safeParse(
      JSON.parse(sessionStorage.getItem(`verixo:settings-draft:v1:${section}`) ?? "null"),
    );
    // Section-specific draft schemas preserve structure while allowing unfinished input.
    return parsed.success ? (parsed.data as Settings[K]) : null;
  } catch {
    return null;
  }
}
export function keepSettingsDraft<K extends SettingsSection>(
  section: K,
  value: Settings[K] | null,
) {
  try {
    const key = `verixo:settings-draft:v1:${section}`;
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch {
    /* Draft recovery is best effort; explicit saves always report errors. */
  }
}
