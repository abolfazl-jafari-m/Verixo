import { type Settings, type SettingsSection } from "./model";
import { getSettingsStore, refreshSettingsSection } from "./store/settings-store";
export { settingsPrefix } from "./store/settings-store";
export class SettingsUnavailableError extends Error {
  constructor() {
    super("Settings could not be read");
    this.name = "SettingsUnavailableError";
  }
}
export type SettingsState<K extends SettingsSection> = { value: Settings[K]; available: boolean };
export function readSettingsSection<K extends SettingsSection>(section: K): SettingsState<K> {
  refreshSettingsSection(section);
  return getSettingsStore(section).store.getState();
}
export function saveSettingsSection<K extends SettingsSection>(section: K, value: Settings[K]) {
  getSettingsStore(section).save(value);
}
