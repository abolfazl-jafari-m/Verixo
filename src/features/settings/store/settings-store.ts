import { createPersistedRecord } from "@/lib/storage/persisted-record";
import {
  defaultSettings,
  migrateLegacySender,
  settingsSchemas,
  type Settings,
  type SettingsSection,
} from "../model";
export const settingsPrefix = "verixo:settings:v2:";
export const legacySettingsPrefix = "verixo:settings:v1:";
export const legacySenderKey = "verixo:shipping-label-settings:v1";

export function createSettingsStore<K extends SettingsSection>(section: K) {
  return createPersistedRecord<Settings[K]>({
    name: settingsPrefix + section,
    initial: defaultSettings[section],
    // Schema and value are indexed by the same section.
    parse: (value) => settingsSchemas[section].parse(value) as Settings[K],
    legacy(storage) {
      const key = legacySettingsPrefix + section;
      const raw = storage.getItem(key);
      if (raw !== null) return { value: JSON.parse(raw), keys: [key] };
      if (section !== "shop" && section !== "shipping") return null;
      const sender = storage.getItem(legacySenderKey);
      if (sender === null) return null;
      const migrated = migrateLegacySender(JSON.parse(sender));
      if (!migrated) throw new Error("Invalid legacy sender");
      // Delete the shared sender only after the other section has a validated new record.
      const other = section === "shop" ? "shipping" : "shop";
      const rawOther = storage.getItem(settingsPrefix + other);
      let keys: string[] = [];
      if (rawOther) {
        try {
          const saved = JSON.parse(rawOther);
          if (saved.version === 1 && settingsSchemas[other].safeParse(saved.state?.value).success)
            keys = [legacySenderKey];
        } catch {
          /* Keep the only recoverable copy if the other section is malformed. */
        }
      }
      return { value: migrated[section], keys };
    },
  });
}
const stores = {
  shop: createSettingsStore("shop"),
  invoices: createSettingsStore("invoices"),
  shipping: createSettingsStore("shipping"),
  reports: createSettingsStore("reports"),
};
export function getSettingsStore<K extends SettingsSection>(section: K) {
  // The mapped collection preserves its key/value association.
  return stores[section] as ReturnType<typeof createSettingsStore<K>>;
}
export function refreshSettingsSection(section: SettingsSection) {
  const record = getSettingsStore(section);
  try {
    record.read();
  } catch {
    /* The store exposes the read failure. */
  }
  return record.store.getState();
}
