// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import {
  defaultSettings,
  invoiceSettingsSnapshot,
  migrateLegacySender,
  resolveSender,
  settingsSchemas,
} from "./model";
import {
  readSettingsSection,
  saveSettingsSection,
  settingsChanged,
  settingsPrefix,
} from "./storage";
import { keepSettingsDraft, readSettingsDraft } from "./drafts";
import { useSettingsSection } from "./use-settings";
import { emptySender } from "@/features/shipping-labels/model";
import {
  OrdersProvider,
  useOrders,
} from "@/features/orders/components/orders-provider/orders-provider";
import { mockOrders } from "@/features/orders/data/mock-orders";
import { createMockInvoice } from "@/features/invoices/utils";
import { readLocalOrders, writeLocalOrder } from "@/features/orders/data/local-orders";

vi.mock("@/lib/i18n/navigations", () => ({ getPathname: () => "/test" }));
beforeEach(() => {
  const records = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    get length() {
      return records.size;
    },
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      records.set(key, value);
    },
    removeItem: (key: string) => {
      records.delete(key);
    },
    clear: () => records.clear(),
    key: (index: number) => [...records.keys()][index] ?? null,
  } satisfies Storage);
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});
const shop = {
  ...defaultSettings.shop,
  name: { fa: "فروشگاه تازه", en: "New shop" },
  phone: "02112345678",
  address: "12 Bahar Street",
};
describe("settings ownership and validation", () => {
  it("ignores inactive dispatch fields and keeps validation messages localized", () => {
    expect(
      settingsSchemas.shipping.safeParse({
        ...defaultSettings.shipping,
        phone: "bad",
        address: "x",
        postalCode: "1",
      }).success,
    ).toBe(true);
    const result = settingsSchemas.shop.safeParse({ ...shop, phone: "bad" });
    expect(result.error?.issues[0].message).toBe("phone");
  });
  it("has explicit independent defaults and rejects invalid business values", () => {
    expect(readSettingsSection("reports").value).toEqual({ period: "month", compare: true });
    const first = readSettingsSection("shop").value;
    first.name.en = "mutation";
    expect(readSettingsSection("shop").value.name.en).toBe(defaultSettings.shop.name.en);
    expect(settingsSchemas.shop.safeParse({ ...shop, name: { fa: "", en: "" } }).success).toBe(
      false,
    );
    expect(settingsSchemas.shop.safeParse({ ...shop, phone: "bad" }).success).toBe(false);
    expect(settingsSchemas.shop.safeParse({ ...shop, postalCode: "123" }).success).toBe(false);
    expect(
      settingsSchemas.invoices.safeParse({
        ...defaultSettings.invoices,
        footer: { en: "x".repeat(1001), fa: "" },
      }).success,
    ).toBe(false);
    expect(
      settingsSchemas.shipping.safeParse({ ...defaultSettings.shipping, useShopContact: false })
        .success,
    ).toBe(false);
    expect(settingsSchemas.reports.safeParse({ period: "custom", compare: true }).success).toBe(
      false,
    );
  });
  it("shares identity across features, with explicit dispatch-only contact precedence", () => {
    const invoice = invoiceSettingsSnapshot(shop, defaultSettings.invoices);
    const shared = resolveSender(shop, defaultSettings.shipping, "en");
    expect(shared.shopName).toBe(invoice.shopName.en);
    expect(shared.senderPhone).toBe(shop.phone);
    expect(resolveSender(shop, defaultSettings.shipping, "fa").shopName).toBe(shop.name.fa);
    const override = resolveSender(
      shop,
      {
        ...defaultSettings.shipping,
        useShopContact: false,
        phone: "02187654321",
        address: "Other warehouse",
        postalCode: "",
      },
      "en",
    );
    expect(override.senderAddress).toBe("Other warehouse");
    expect(override.senderPostalCode).toBe(""); // explicit absence does not inherit shop postal code
    expect(override.shopName).toBe(shop.name.en);
    expect(invoice.contact).toContain(shop.address);
    expect(
      settingsSchemas.shop.safeParse({ ...shop, phone: "", address: "", postalCode: "", logo: "" })
        .success,
    ).toBe(true);
  });
  it("migrates legacy labels without rewriting source records; central values take precedence", () => {
    const legacy = {
      ...emptySender,
      shopName: "Legacy shop",
      senderPhone: shop.phone,
      senderAddress: shop.address,
      senderName: "Sender",
    };
    localStorage.setItem("verixo:shipping-label-settings:v1", JSON.stringify(legacy));
    expect(readSettingsSection("shop").value.name.en).toBe("Legacy shop");
    expect(readSettingsSection("shipping").value.senderName).toBe("Sender");
    saveSettingsSection("shop", shop);
    expect(readSettingsSection("shop").value).toEqual(shop);
    expect(JSON.parse(localStorage.getItem("verixo:shipping-label-settings:v1")!)).toEqual(legacy);
    expect(migrateLegacySender({})).toBeNull();
  });
});
describe("persistence, drafts and subscriptions", () => {
  it("saves independent sections and reports corrupt data without replacing it", () => {
    saveSettingsSection("shop", shop);
    saveSettingsSection("reports", { period: "today", compare: false });
    expect(readSettingsSection("shop").value).toEqual(shop);
    expect(readSettingsSection("reports").value.period).toBe("today");
    localStorage.setItem(settingsPrefix + "shipping", "broken");
    expect(readSettingsSection("shipping").available).toBe(false);
    expect(localStorage.getItem(settingsPrefix + "shipping")).toBe("broken");
    saveSettingsSection("shipping", defaultSettings.shipping);
    expect(readSettingsSection("shipping").available).toBe(true);
  });
  it("never reports success on failed persistence and permits retry", () => {
    const event = vi.fn();
    window.addEventListener(settingsChanged, event);
    const write = vi.spyOn(localStorage, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    expect(() => saveSettingsSection("shop", shop)).toThrow("quota");
    expect(event).not.toHaveBeenCalled();
    expect(readSettingsSection("shop").value).toEqual(defaultSettings.shop);
    saveSettingsSection("shop", shop);
    expect(readSettingsSection("shop").value).toEqual(shop);
    expect(event).toHaveBeenCalledTimes(1);
    write.mockRestore();
    window.removeEventListener(settingsChanged, event);
  });
  it("keeps unfinished drafts out of saved settings and supports discard", () => {
    keepSettingsDraft("shop", { ...shop, name: { en: "", fa: "" } });
    expect(readSettingsDraft("shop")?.name.en).toBe("");
    expect(readSettingsSection("shop").value.name.en).toBe(defaultSettings.shop.name.en);
    keepSettingsDraft("shop", null);
    expect(readSettingsDraft("shop")).toBeNull();
  });
  it("notifies only consumers of the saved section", async () => {
    const { result } = renderHook(() => ({
      shop: useSettingsSection("shop"),
      reports: useSettingsSection("reports"),
    }));
    await waitFor(() => expect(result.current.shop.ready).toBe(true));
    const reportsBefore = result.current.reports;
    act(() => saveSettingsSection("shop", shop));
    expect(result.current.shop.value.name.en).toBe("New shop");
    expect(result.current.reports).toBe(reportsBefore);
  });
});
describe("historical protection", () => {
  it("does not issue an invoice using fallback identity when saved settings are corrupt", async () => {
    localStorage.setItem(settingsPrefix + "shop", "invalid");
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    const before = result.current.orders.length;
    expect(() =>
      result.current.createOrder({ notes: "", shipping: 0, payment: "pending", lines: [] }),
    ).toThrow("Settings could not be read");
    expect(result.current.orders).toHaveLength(before);
  });
  it("captures new invoice branding through the real order provider, never rewrites existing records", async () => {
    const old = structuredClone(mockOrders[0]);
    writeLocalOrder(old);
    saveSettingsSection("shop", shop);
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() =>
      result.current.createOrder({
        notes: "",
        shipping: 0,
        payment: "pending",
        lines: structuredClone(old.lines),
      }),
    );
    const created = structuredClone(result.current.orders[0]);
    expect(created.invoice.settingsSnapshot.shopName.en).toBe(shop.name.en);
    act(() => saveSettingsSection("shop", { ...shop, name: { fa: "دیگر", en: "Later shop" } }));
    expect(readLocalOrders([]).orders.find((item) => item.id === created.id)).toEqual(created);
    expect(readLocalOrders([]).orders.find((item) => item.id === old.id)).toEqual(old);
    expect(created.lines.map((line) => line.unitCostSnapshot)).toEqual(
      old.lines.map((line) => line.unitCostSnapshot),
    );
    const legacyInvoice = createMockInvoice(old);
    expect(legacyInvoice.settingsSnapshot.shopName).toEqual(defaultSettings.shop.name);
  });
  it("clones nested invoice settings instead of sharing mutable profile objects", () => {
    const profile = structuredClone(shop);
    const snapshot = invoiceSettingsSnapshot(profile, defaultSettings.invoices);
    profile.name.en = "changed";
    expect(snapshot.shopName.en).toBe("New shop");
  });
});
