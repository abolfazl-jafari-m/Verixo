import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createInventoryStore } from "./repository";
import { MemoryStorage } from "@/lib/storage/__tests__/memory-storage";
import { orderProducts } from "@/features/products/data/order-products";
import { mockOrders } from "@/features/orders/data/mock-orders";
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
beforeEach(() => vi.stubGlobal("window", { localStorage: new MemoryStorage() }));
afterEach(() => vi.unstubAllGlobals());
it("migrates the catalog and transaction receipts together without refreshing historical values", () => {
  const order = {
    ...mockOrders[0],
    status: "cancelled",
    cancelledAt: "2026-10-25T00:00:00.000Z",
    cancellationReason: { code: "duplicate", note: "" },
  };
  const snapshot = {
    products: orderProducts,
    receipts: { [order.id]: { state: "released", entries: [], order } },
  };
  window.localStorage.setItem("verixo:inventory:v1", JSON.stringify(snapshot));
  const restored = createInventoryStore([]).read().value;
  expect(restored).toEqual(snapshot);
  expect(window.localStorage.getItem("verixo:inventory:v1")).toBeNull();
  expect(createInventoryStore([]).read().value).toEqual(restored);
});
it("rejects invalid inventory instead of replacing a corrupt snapshot with seed products", () => {
  const raw = JSON.stringify({ products: [{ ...orderProducts[0], stock: -1 }], receipts: {} });
  window.localStorage.setItem("verixo:inventory:v1", raw);
  expect(() => createInventoryStore(orderProducts).read()).toThrow();
  expect(window.localStorage.getItem("verixo:inventory:v1")).toBe(raw);
  expect(window.localStorage.getItem("verixo:inventory:v2")).toBeNull();
});
