import type {
  Product,
  ProductAttribute,
  ProductStatus,
  ProductType,
  ProductVariant,
} from "./types";

export const MAX_VARIANTS = 200;
export const normalize = (value: string) => value.trim().normalize("NFKC").toLocaleLowerCase();

export function combinationKey(values: Record<string, string>) {
  return JSON.stringify(Object.entries(values).sort(([a], [b]) => a.localeCompare(b)));
}

export function variantsMatch(combinations: Record<string, string>[], variants: ProductVariant[]) {
  const expected = new Set(combinations.map(combinationKey));
  const actual = new Set(variants.map((variant) => combinationKey(variant.attributeValues)));
  return (
    actual.size === variants.length &&
    expected.size === actual.size &&
    [...actual].every((key) => expected.has(key))
  );
}

export function variantCombinations(attributes: ProductAttribute[]): Record<string, string>[] {
  const selected = attributes.filter((attribute) => attribute.useForVariants);
  if (!selected.length || selected.some((attribute) => !attribute.values.length)) return [];
  if (selected.reduce((count, attribute) => count * attribute.values.length, 1) > MAX_VARIANTS) {
    throw new Error("variantLimit");
  }
  return selected.reduce<Record<string, string>[]>(
    (combinations, attribute) =>
      combinations.flatMap((combination) =>
        attribute.values.map((value) => ({ ...combination, [attribute.id]: value.trim() })),
      ),
    [{}],
  );
}

// Exact combinations retain identity and all merchant-entered values. New combinations start empty.
export function reconcileVariants(
  combinations: Record<string, string>[],
  existing: ProductVariant[],
  createId: () => string,
) {
  const previous = new Map(
    existing.map((variant) => [combinationKey(variant.attributeValues), variant]),
  );
  return combinations.map(
    (attributeValues) =>
      previous.get(combinationKey(attributeValues)) ?? {
        id: createId(),
        attributeValues,
        sku: "",
        price: 0,
        costPrice: null,
        stock: 0,
        trackInventory: true,
        reservedQuantity: 0,
        lowStockThreshold: 5,
        isActive: true,
      },
  );
}

export function productSummary(product: Product) {
  const entries =
    product.type === "simple" ? [product] : product.variants.filter((variant) => variant.isActive);
  return {
    minPrice: entries.length ? Math.min(...entries.map((entry) => entry.price)) : null,
    maxPrice: entries.length ? Math.max(...entries.map((entry) => entry.price)) : null,
    stock: entries.reduce((total, entry) => total + entry.stock, 0),
  };
}

export interface ProductFilters {
  search: string;
  type: ProductType | "all";
  status: ProductStatus | "all";
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  const search = normalize(filters.search);
  return products.filter(
    (product) =>
      (filters.type === "all" || product.type === filters.type) &&
      (filters.status === "all" || product.status === filters.status) &&
      [
        product.name,
        product.sku ?? "",
        ...(product.type === "variable"
          ? product.variants.map((variant) => variant.sku ?? "")
          : []),
      ].some((value) => normalize(value).includes(search)),
  );
}
