import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { MemoryStorage } from "@/lib/storage/__tests__/memory-storage";
import type { CreateOrderValues } from "../types";
import type { Product } from "@/features/products/types";

vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
const product: Product = {
  id: "test-product",
  name: "Test product",
  description: "",
  images: [],
  attributes: [],
  status: "active",
  type: "simple",
  price: 100,
  costPrice: 40,
  stock: 10,
  createdAt: "2026-01-01T00:00:00.000Z",
};
const values: CreateOrderValues = {
  payment: "pending",
  notes: "",
  shipping: 0,
  lines: [
    {
      productId: product.id,
      name: product.name,
      quantity: 2,
      unitPrice: 100,
      unitCostSnapshot: 40,
    },
  ],
};
async function setup() {
  const { inventoryRepository } = await import("@/features/inventory/repository");
  inventoryRepository.seed([product]);
  const { createOrdersStore } = await import("./orders-store");
  const store = createOrdersStore();
  store.getState().refresh();
  const current = () =>
    store.getState().orders.find((order) => order.lines[0]?.productId === product.id)!;
  return { store, current, inventoryRepository, createOrdersStore };
}
beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: new MemoryStorage(),
    sessionStorage: new MemoryStorage(),
    Storage: MemoryStorage,
  });
  vi.resetModules();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("order store and inventory persistence", () => {
  it("creates and edits orders, freezes historical costs and invoice identity, and restores on reload", async () => {
    const { store, current, createOrdersStore, inventoryRepository } = await setup();
    store.getState().createOrder(values);
    const original = current();
    expect(store.getState().createdNumber).toBe(original.number);
    expect(store.getState().sendInvoice(original.id)).toBe(true);
    expect(
      store.getState().updateInvoice(original.id, { shipping: 20, unitPrices: [{ value: 150 }] }),
    ).toBe(true);
    inventoryRepository.save({ ...product, costPrice: 80 });
    const { readSettingsSection, saveSettingsSection } =
      await import("@/features/settings/storage");
    saveSettingsSection("shop", {
      ...readSettingsSection("shop").value,
      name: { fa: "New shop", en: "New shop" },
    });
    expect(current().lines[0].unitCostSnapshot).toBe(40);
    expect(current().invoice).toEqual(original.invoice);
    const reloaded = createOrdersStore();
    expect(reloaded.getState().ready).toBe(false);
    reloaded.getState().refresh();
    expect(reloaded.getState().orders.find((o) => o.id === original.id)).toEqual(current());
    expect(reloaded.getState().createdNumber).toBeNull();
    expect(window.localStorage.getItem("verixo:orders:v2:" + original.id)).not.toContain(
      "createdNumber",
    );
    store.getState().dismissSuccess();
    expect(store.getState().createdNumber).toBeNull();
    store.getState().createOrder(values);
    expect(current().invoice.settingsSnapshot.shopName.en).toBe("New shop");
    expect(store.getState().orders.find((order) => order.id === original.id)?.invoice).toEqual(
      original.invoice,
    );
  });
  it("preserves payment but blocks fulfillment when stock is insufficient, then retries", async () => {
    const { store, current, inventoryRepository } = await setup();
    store
      .getState()
      .createOrder({ ...values, payment: "paid", lines: [{ ...values.lines[0], quantity: 11 }] });
    const id = current().id;
    expect(current()).toMatchObject({ payment: "paid", inventory: { state: "exception" } });
    expect(store.getState().moveOrder(id, "delivered")).toBe(false);
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 10 });
    inventoryRepository.adjust(product.id, undefined, 20, 5);
    store.getState().resolveInventory(id);
    expect(current().inventory?.state).toBe("reserved");
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 20, reservedQuantity: 11 });
  });
  it("reserves on payment and releases exactly once on cancellation, including failed secondary writes", async () => {
    const { store, current, inventoryRepository, createOrdersStore } = await setup();
    store.getState().createOrder(values);
    const id = current().id;
    expect(store.getState().moveOrder(id, "paid")).toBe(true);
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 10, reservedQuantity: 2 });
    const originalSet = window.Storage.prototype.setItem;
    vi.spyOn(window.Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key.startsWith("verixo:orders:v2:")) throw new Error("quota");
      originalSet.call(this, key, value);
    });
    store.getState().cancelOrder(id, { code: "customer_request", note: "" });
    expect(current().status).toBe("cancelled");
    expect(store.getState().storageAvailable).toBe(false);
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 10, reservedQuantity: 0 });
    vi.restoreAllMocks();
    const reloaded = createOrdersStore();
    reloaded.getState().refresh();
    expect(reloaded.getState().orders.find((o) => o.id === id)?.status).toBe("cancelled");
    reloaded.getState().cancelOrder(id, { code: "customer_request", note: "" });
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 10, reservedQuantity: 0 });
    expect(reloaded.getState().moveOrder(id, "paid")).toBe(false);
  });
  it("does not change stock or cancellation state when the atomic inventory write fails", async () => {
    const { store, current, inventoryRepository } = await setup();
    store.getState().createOrder({ ...values, payment: "paid" });
    const original = current();
    const originalSet = window.Storage.prototype.setItem;
    vi.spyOn(window.Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key === "verixo:inventory:v2") throw new Error("quota");
      originalSet.call(this, key, value);
    });
    expect(() =>
      store.getState().cancelOrder(original.id, { code: "duplicate", note: "" }),
    ).toThrow("storage");
    expect(current()).toEqual(original);
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 10, reservedQuantity: 2 });
  });
  it("completes inventory once and archives/restores without changing financial snapshots", async () => {
    const { store, current, inventoryRepository } = await setup();
    store.getState().createOrder({ ...values, payment: "paid" });
    const id = current().id;
    expect(
      store.getState().submitCustomerInformation(current().customerFormToken!, {
        name: "Test Customer",
        phone: "09123456789",
        province: "Tehran",
        city: "Tehran",
        address: "A valid test street address",
        postalCode: "1234567890",
        deliveryNotes: "",
        shippingMethod: "post",
      }),
    ).toBe(true);
    expect(store.getState().moveOrder(id, "delivered")).toBe(true);
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 8, reservedQuantity: 0 });
    store.getState().moveOrder(id, "delivered");
    expect(inventoryRepository.list()[0]).toMatchObject({ stock: 8, reservedQuantity: 0 });
    const delivered = current();
    expect(store.getState().archiveOrders([id, id]).changed).toEqual([id]);
    expect(current()).toEqual({ ...delivered, archivedAt: expect.any(String) });
    expect(store.getState().archiveOrders([id], true).changed).toEqual([id]);
    expect(current()).toEqual(delivered);
    vi.spyOn(window.Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(store.getState().archiveOrders([id]).failed).toEqual([id]);
    expect(current().archivedAt).toBeNull();
  });
  it("migrates per-order legacy records, keeps unrelated records, and preserves null costs", async () => {
    const { store, current, createOrdersStore } = await setup();
    store.getState().createOrder(values);
    const order = current();
    const legacy = {
      ...order,
      id: "legacy",
      invoice: undefined,
      lines: order.lines.map((line) => ({ ...line, unitCostSnapshot: undefined })),
    };
    window.localStorage.setItem("verixo:mock-orders:v1:legacy", JSON.stringify(legacy));
    const fresh = createOrdersStore();
    fresh.getState().refresh();
    const migrated = fresh.getState().orders.find((o) => o.id === "legacy")!;
    expect(migrated.lines[0].unitCostSnapshot).toBeNull();
    expect(migrated.invoice).toBeDefined();
    expect(fresh.getState().orders.some((o) => o.id === order.id)).toBe(true);
    expect(window.localStorage.getItem("verixo:mock-orders:v1:legacy")).toBeNull();
    fresh.getState().refresh();
    expect(fresh.getState().orders.find((o) => o.id === "legacy")?.invoice).toEqual(
      migrated.invoice,
    );
  });
  it("keeps new order records authoritative and reports corruption without rewriting it", async () => {
    const { store, current } = await setup();
    store.getState().createOrder(values);
    const original = current();
    window.localStorage.setItem(
      "verixo:mock-orders:v1:" + original.id,
      JSON.stringify({ ...original, notes: "stale" }),
    );
    store.getState().refresh();
    expect(current().notes).toBe("");
    window.localStorage.setItem("verixo:orders:v2:broken", "{");
    store.getState().refresh();
    expect(store.getState().storageAvailable).toBe(false);
    expect(window.localStorage.getItem("verixo:orders:v2:broken")).toBe("{");
  });
});
