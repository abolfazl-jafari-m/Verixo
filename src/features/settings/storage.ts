import {
  defaultSettings,
  migrateLegacySender,
  settingsSchemas,
  type Settings,
  type SettingsSection,
} from "./model";

export const settingsPrefix = "verixo:settings:v1:";
export const settingsChanged = "verixo:settings-changed";
export class SettingsUnavailableError extends Error {
  constructor() {
    super("Settings could not be read");
    this.name = "SettingsUnavailableError";
  }
}
export type SettingsState<K extends SettingsSection> = { value: Settings[K]; available: boolean };
export function readSettingsSection<K extends SettingsSection>(section: K): SettingsState<K> {
  const fallback = structuredClone(defaultSettings[section]);
  try {
    const raw = localStorage.getItem(settingsPrefix + section);
    if (raw !== null) {
      const parsed = settingsSchemas[section].safeParse(JSON.parse(raw));
      // The selected schema and return type have the same section key.
      return {
        value: parsed.success ? (parsed.data as Settings[K]) : fallback,
        available: parsed.success,
      };
    }
    if (section === "shop" || section === "shipping") {
      const legacy = localStorage.getItem("verixo:shipping-label-settings:v1");
      if (legacy) {
        const migrated = migrateLegacySender(JSON.parse(legacy));
        return {
          value: migrated
            ? ((section === "shop" ? migrated.shop : migrated.shipping) as Settings[K])
            : fallback,
          available: !!migrated,
        };
      }
    }
    return { value: fallback, available: true };
  } catch {
    return { value: fallback, available: false };
  }
}
// Independent section keys avoid overwriting other sections edited in another tab.
// A failed write throws; no success event or in-memory optimistic save is emitted.
export function saveSettingsSection<K extends SettingsSection>(section: K, value: Settings[K]) {
  const validated = settingsSchemas[section].parse(value);
  localStorage.setItem(settingsPrefix + section, JSON.stringify(validated));
  window.dispatchEvent(new CustomEvent(settingsChanged, { detail: section }));
}
