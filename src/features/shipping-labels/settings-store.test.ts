// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptySender } from "./model";
import { readSenderSettings } from "./settings-store";
import { readLogo } from "./logo";
import { defaultSettings } from "@/features/settings/model";
import { settingsPrefix } from "@/features/settings/storage";
afterEach(() => vi.unstubAllGlobals());
describe("centralized sender adapter", () => {
  it("reads the shared shop identity without inventing contact details", () => {
    vi.stubGlobal("localStorage", { getItem: () => null });
    expect(readSenderSettings("en").settings).toEqual({
      ...emptySender,
      shopName: defaultSettings.shop.name.en,
    });
  });
  it("resolves shared contact and a saved shipping override", () => {
    const shop = { ...defaultSettings.shop, phone: "02112345678", address: "Shop address" };
    const shipping = {
      ...defaultSettings.shipping,
      useShopContact: false,
      phone: "02187654321",
      address: "Warehouse address",
    };
    vi.stubGlobal("localStorage", {
      getItem: (key: string) =>
        key === settingsPrefix + "shop"
          ? JSON.stringify(shop)
          : key === settingsPrefix + "shipping"
            ? JSON.stringify(shipping)
            : null,
    });
    expect(readSenderSettings().settings.senderAddress).toBe("Warehouse address");
    expect(readSenderSettings().settings.shopName).toBe(shop.name.fa);
  });
  it("reports corrupt or unavailable storage", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readSenderSettings().available).toBe(false);
  });
  it("rejects unsupported and oversized uploads", async () => {
    await expect(
      readLogo(new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" })),
    ).rejects.toThrow();
    await expect(
      readLogo(new File([new Uint8Array(1_000_001)], "logo.png", { type: "image/png" })),
    ).rejects.toThrow();
  });
});
