"use client";
import { useEffect } from "react";
import { useStore } from "zustand";
import { type SettingsSection } from "./model";
import {
  getSettingsStore,
  refreshSettingsSection,
  settingsPrefix,
  legacySettingsPrefix,
  legacySenderKey,
} from "./store/settings-store";
export function useSettingsSection<K extends SettingsSection>(section: K) {
  const record = getSettingsStore(section);
  const value = useStore(record.store, (state) => state.value);
  const ready = useStore(record.store, (state) => state.ready);
  const available = useStore(record.store, (state) => state.available);
  useEffect(() => {
    const refresh = () => {
      refreshSettingsSection(section);
    };
    const storage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === settingsPrefix + section ||
        event.key === legacySettingsPrefix + section ||
        event.key === legacySenderKey
      )
        refresh();
    };
    refresh();
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
    };
  }, [section]);
  return { value, ready, available };
}
