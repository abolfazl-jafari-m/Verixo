"use client";
import { useEffect, useState } from "react";
import { defaultSettings, type SettingsSection } from "./model";
import { readSettingsSection, settingsChanged, settingsPrefix } from "./storage";

export function useSettingsSection<K extends SettingsSection>(section: K) {
  const [state, setState] = useState({
    value: defaultSettings[section],
    available: true,
    ready: false,
  });
  useEffect(() => {
    const refresh = () => setState({ ...readSettingsSection(section), ready: true });
    const change = (event: Event) => {
      if ((event as CustomEvent<SettingsSection>).detail === section) refresh();
    };
    const storage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === settingsPrefix + section ||
        event.key === "verixo:shipping-label-settings:v1"
      )
        refresh();
    };
    refresh();
    window.addEventListener(settingsChanged, change);
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(settingsChanged, change);
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
    };
  }, [section]);
  return state;
}
