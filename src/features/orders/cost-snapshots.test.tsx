// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { orderProducts } from "@/features/products/data/order-products";
import { productService } from "@/features/products/services/product-service";
import { createOrderLines } from "./utils";
import { createOrderFormSchema } from "./schemas/order-schema";
import { mockOrders } from "./data/mock-orders";
import { localOrderPrefix, readLocalOrders, writeLocalOrder } from "./data/local-orders";
import { OrdersProvider, useOrders } from "./components/orders-provider/orders-provider";

// URL generation is unrelated to cost snapshots; avoid Next's router in the unit environment.
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: () => "/test" }));
beforeEach(() => {
  // Node's experimental localStorage shadows jsdom on this runtime.
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
  localStorage.clear();
  vi.unstubAllGlobals();
});
describe("order acquisition-cost snapshots", () => {
  it("captures the selected simple or variant unit cost, including explicit zero", () => {
    const products = structuredClone(orderProducts);
    if (products[2].type !== "variable") throw new Error("Expected variants");
    products[2].variants[1].costPrice = 0;
    const lines = createOrderLines(
      [
        { productId: "order-mug", variantId: "", quantity: 3 },
        { productId: "order-shirt", variantId: "shirt-black-l", quantity: 2 },
        { productId: "order-shirt", variantId: "shirt-cream-m", quantity: 1 },
      ],
      products,
    );
    expect(lines.map((line) => line.unitCostSnapshot)).toEqual([150000, 0, null]);
    expect(lines.map((line) => line.unitPrice)).toEqual([285000, 620000, 650000]);
    expect(lines[0].adjustments).toEqual({ discount: 0, refund: 0 });
  });
  it("keeps captured cost immutable when the current product changes", async () => {
    const products = structuredClone(orderProducts);
    const lines = createOrderLines(
      [{ productId: "order-mug", variantId: "", quantity: 1 }],
      products,
    );
    const product = products[0];
    if (product.type !== "simple") throw new Error("Expected simple");
    product.costPrice = 999;
    await productService.save(product);
    expect(lines[0].unitCostSnapshot).toBe(150000);
    expect(
      createOrderLines(
        [{ productId: "order-mug", variantId: "", quantity: 1 }],
        await productService.list(),
      )[0].unitCostSnapshot,
    ).toBe(999);
  });
  it("validates order selections against the shared catalog, including newly saved products", async () => {
    const product = { ...orderProducts[0], id: "new-catalog-item" };
    await productService.save(product);
    const schema = createOrderFormSchema(await productService.list());
    expect(
      schema.safeParse({
        notes: "",
        payment: "pending",
        shipping: 0,
        lines: [{ productId: product.id, variantId: "", quantity: 1 }],
      }).success,
    ).toBe(true);
  });
  it("loads legacy missing snapshots as unknown without looking up current costs", () => {
    const legacy = structuredClone(mockOrders[0]);
    legacy.lines = legacy.lines.map((line) => ({ ...line, unitCostSnapshot: undefined }));
    localStorage.setItem(`${localOrderPrefix}${legacy.id}`, JSON.stringify(legacy));
    const loaded = readLocalOrders(mockOrders).orders.find((order) => order.id === legacy.id)!;
    expect(loaded.lines.every((line) => line.unitCostSnapshot === null)).toBe(true);
  });
  it("persists known, zero and unknown snapshots without changing them", () => {
    const order = {
      ...mockOrders[0],
      lines: [
        { ...mockOrders[0].lines[0], unitCostSnapshot: 123 },
        { ...mockOrders[0].lines[0], unitCostSnapshot: 0 },
        { ...mockOrders[0].lines[0], unitCostSnapshot: null },
      ],
    };
    expect(writeLocalOrder(order)).toBe(true);
    expect(readLocalOrders([]).orders[0].lines.map((line) => line.unitCostSnapshot)).toEqual([
      123,
      0,
      null,
    ]);
  });
  it("preserves acquisition costs through actual provider invoice edits, payment and customer-information edits", async () => {
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() =>
      result.current.createOrder({
        notes: "original",
        shipping: 0,
        payment: "pending",
        lines: createOrderLines(
          [{ productId: "order-mug", variantId: "", quantity: 2 }],
          orderProducts,
        ),
      }),
    );
    const id = result.current.orders[0].id;
    act(() => {
      expect(
        result.current.updateInvoice(id, { shipping: 75, unitPrices: [{ value: 500000 }] }),
      ).toBe(true);
    });
    expect(result.current.orders.find((order) => order.id === id)?.lines[0]).toMatchObject({
      unitCostSnapshot: 150000,
      unitPrice: 500000,
    });
    act(() => {
      expect(result.current.moveOrder(id, "paid")).toBe(true);
    });
    const order = result.current.orders.find((order) => order.id === id)!;
    expect(order.lines[0].unitCostSnapshot).toBe(150000);
    const fields = mockOrders.find((item) => item.customer)?.customer;
    if (!fields || !order.customerFormToken) throw new Error("Missing fixture data");
    act(() => {
      expect(
        result.current.submitCustomerInformation(order.customerFormToken!, {
          ...fields,
          shippingMethod: "post",
        }),
      ).toBe(true);
    });
    expect(result.current.orders.find((item) => item.id === id)?.lines[0].unitCostSnapshot).toBe(
      150000,
    );
    expect(
      readLocalOrders([]).orders.find((item) => item.id === id)?.lines[0].unitCostSnapshot,
    ).toBe(150000);
  });
});
