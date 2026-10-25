import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createSettingsStore } from "./settings-store";
import { defaultSettings } from "../model";
import { createSettingsDraftStore } from "../drafts";

beforeEach(() => {
  const storage = () => {
    const values = new Map<string, string>();
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    };
  };
  vi.stubGlobal("window", { localStorage: storage(), sessionStorage: storage() });
});
afterEach(() => vi.unstubAllGlobals());
it("migrates settings independently without persisting unsaved drafts into saved values", () => {
  const legacy = { ...defaultSettings.reports, compare: false };
  window.localStorage.setItem("verixo:settings:v1:reports", JSON.stringify(legacy));
  const reports = createSettingsStore("reports");
  expect(reports.read().value).toEqual(legacy);
  expect(window.localStorage.getItem("verixo:settings:v1:reports")).toBeNull();
  createSettingsDraftStore("reports").save({ ...legacy, compare: true });
  expect(createSettingsStore("reports").read().value.compare).toBe(false);
  expect(createSettingsDraftStore("reports").read().value?.compare).toBe(true);
  expect(window.localStorage.getItem("verixo:settings-draft:v2:reports")).toBeNull();
});
it("migrates tab-local unfinished drafts and discards them without resurrecting legacy data", () => {
  const draft = { ...defaultSettings.shop, name: { fa: "", en: "" } };
  window.sessionStorage.setItem("verixo:settings-draft:v1:shop", JSON.stringify(draft));
  expect(createSettingsDraftStore("shop").read().value).toEqual(draft);
  createSettingsDraftStore("shop").save(null);
  expect(createSettingsDraftStore("shop").read().value).toBeNull();
  expect(window.sessionStorage.getItem("verixo:settings-draft:v1:shop")).toBeNull();
});
it("migrates the shared legacy sender into both sections before removing it", () => {
  const sender = {
    shopName: "Legacy shop",
    logo: "",
    senderName: "Sender",
    senderPhone: "02112345678",
    senderAddress: "Valid sender street address",
    senderPostalCode: "1234567890",
  };
  window.localStorage.setItem("verixo:shipping-label-settings:v1", JSON.stringify(sender));
  const shop = createSettingsStore("shop").read().value;
  expect(shop.name.en).toBe(sender.shopName);
  expect(window.localStorage.getItem("verixo:shipping-label-settings:v1")).not.toBeNull();
  expect(createSettingsStore("shipping").read().value.senderName).toBe("Sender");
  expect(window.localStorage.getItem("verixo:shipping-label-settings:v1")).toBeNull();
  expect(createSettingsStore("shop").read().value).toEqual(shop);
});
