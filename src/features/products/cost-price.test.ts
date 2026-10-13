import { describe, expect, it } from "vitest";
import {
  costPriceSchema,
  productDefaults,
  productFormSchema,
  toProduct,
} from "./schemas/product-schema";
import { reconcileVariants } from "./utils";
import { orderProducts } from "./data/order-products";
import { productService } from "./services/product-service";

describe("product acquisition cost", () => {
  it("accepts unknown and explicit zero; rejects negative, fractional, nonfinite and unsafe costs", () => {
    for (const value of [null, 0, 350000])
      expect(costPriceSchema.safeParse(value).success).toBe(true);
    for (const value of [-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])
      expect(costPriceSchema.safeParse(value).success).toBe(false);
  });
  it("validates simple costs and preserves them through an unrelated edit", () => {
    const product = orderProducts[0];
    const values = productDefaults(product);
    values.description = "Updated description";
    expect(productFormSchema.safeParse(values).success).toBe(true);
    expect(toProduct(values, product)).toMatchObject({ costPrice: 150000 });
    values.costPrice = -1;
    expect(productFormSchema.safeParse(values).success).toBe(false);
  });
  it("keeps missing costs null through new product defaults and editing", () => {
    expect(productDefaults().costPrice).toBeNull();
    const product = orderProducts[1];
    const values = productDefaults(product);
    values.name = "Renamed bag";
    expect(toProduct(values, product)).toMatchObject({ costPrice: null });
  });
  it("stores independent variant costs and never emits a parent-level cost", () => {
    const product = orderProducts[2];
    const values = productDefaults(product);
    values.variants[0].costPrice = 100;
    values.variants[1].costPrice = 200;
    values.variants[2].costPrice = null;
    values.variants[3].costPrice = 0;
    values.costPrice = 999; // Inactive simple branch is not authoritative.
    expect(productFormSchema.safeParse(values).success).toBe(true);
    const result = toProduct(values, product);
    expect(result).not.toHaveProperty("costPrice");
    if (result.type !== "variable") throw new Error("Expected variants");
    expect(result.variants.map((variant) => variant.costPrice)).toEqual([100, 200, null, 0]);
    values.variants[1].costPrice = -3;
    expect(productFormSchema.safeParse(values).success).toBe(false);
  });
  it("retains existing combination costs and leaves new combinations unknown", () => {
    const previous = {
      id: "old",
      attributeValues: { color: "red" },
      price: 150,
      costPrice: 80,
      stock: 2,
      isActive: true,
    };
    const variants = reconcileVariants(
      [{ color: "red" }, { color: "blue" }],
      [previous],
      () => "new",
    );
    expect(variants[0]).toEqual(previous);
    expect(variants[1].costPrice).toBeNull();
  });
  it("round-trips acquisition costs through the existing product repository without aliasing", async () => {
    const product = { ...orderProducts[0], id: "cost-test-product" };
    const saved = await productService.save(product);
    saved.name = "Mutated copy";
    const listed = (await productService.list()).find((item) => item.id === product.id);
    expect(listed).toEqual(product);
  });
});
