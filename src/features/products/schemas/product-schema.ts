import { z } from "zod";
import type { Product, ProductAttribute } from "../types";
import { MAX_VARIANTS, normalize, variantCombinations, variantsMatch } from "../utils";

const required = z.string().trim().min(1, "required");
const price = z.number({ error: "price" }).min(0, "price").max(Number.MAX_SAFE_INTEGER, "price");
// Whole toman; explicit zero supports donated/free inventory. Blank is unknown.
export const costPriceSchema = z
  .number({ error: "costPrice" })
  .int("costPrice")
  .min(0, "costPrice")
  .max(Number.MAX_SAFE_INTEGER, "costPrice")
  .nullable();
const stock = z
  .number({ error: "stock" })
  .int("stock")
  .min(0, "stock")
  .max(Number.MAX_SAFE_INTEGER, "stock");
const attributeSchema = z
  .object({
    id: required,
    name: required,
    values: z.array(z.object({ value: required })).min(1, "valuesRequired"),
    useForVariants: z.boolean(),
  })
  .superRefine((attribute, ctx) => {
    const seen = new Set<string>();
    attribute.values.forEach(({ value }, index) => {
      if (seen.has(normalize(value)))
        ctx.addIssue({
          code: "custom",
          path: ["values", index, "value"],
          message: "duplicateValue",
        });
      seen.add(normalize(value));
    });
  });

const attributesSchema = z.array(attributeSchema).superRefine((attributes, ctx) => {
  const seen = new Set<string>();
  attributes.forEach((attribute, index) => {
    if (seen.has(normalize(attribute.name)))
      ctx.addIssue({ code: "custom", path: [index, "name"], message: "duplicateAttribute" });
    seen.add(normalize(attribute.name));
  });
});

export const variantSchema = z.object({
  id: required,
  sku: z.string().optional(),
  attributeValues: z.record(z.string(), required),
  price,
  costPrice: costPriceSchema,
  stock,
  trackInventory: z.boolean().optional(),
  reservedQuantity: stock.optional(),
  lowStockThreshold: stock.optional(),
  isActive: z.boolean(),
});

// The form is an editing workspace: both branches are retained while switching type.
// Only the selected branch is validated and converted into the discriminated domain model.
export const productFormSchema = z
  .object({
    name: required.max(200, "nameLength"),
    description: z.string(),
    sku: z.string(),
    status: z.enum(["active", "draft", "archived"]),
    type: z.enum(["simple", "variable"]),
    images: z.array(
      z.object({
        url: z
          .string()
          .trim()
          .url("imageUrl")
          .refine(
            (url) =>
              /^https?:\/\//i.test(url) ||
              (url.length <= 2_666_700 &&
                /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(url)),
            "imageUrl",
          ),
      }),
    ),
    attributes: attributesSchema,
    price: z.number().or(z.nan()),
    costPrice: z.number().or(z.nan()).nullable(),
    stock: z.number().or(z.nan()),
    trackInventory: z.boolean().optional(),
    reservedQuantity: stock.optional(),
    lowStockThreshold: stock.optional(),
    variants: z.array(
      z.object({
        id: z.string(),
        sku: z.string().optional(),
        attributeValues: z.record(z.string(), z.string()),
        price: z.number().or(z.nan()),
        costPrice: z.number().or(z.nan()).nullable(),
        stock: z.number().or(z.nan()),
        trackInventory: z.boolean().optional(),
        reservedQuantity: stock.optional(),
        lowStockThreshold: stock.optional(),
        isActive: z.boolean(),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (values.type === "simple") {
      if (values.stock < (values.reservedQuantity ?? 0))
        ctx.addIssue({ code: "custom", path: ["stock"], message: "reservedStock" });
      for (const [field, schema] of [
        ["price", price],
        ["costPrice", costPriceSchema],
        ["stock", stock],
      ] as const) {
        if (!schema.safeParse(values[field]).success)
          ctx.addIssue({ code: "custom", path: [field], message: field });
      }
      return;
    }
    let combinations: Record<string, string>[];
    try {
      combinations = variantCombinations(toAttributes(values.attributes));
    } catch {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "variantLimit" });
      return;
    }
    if (!combinations.length)
      ctx.addIssue({ code: "custom", path: ["variants"], message: "variantAttributes" });
    if (values.variants.length > MAX_VARIANTS || !variantsMatch(combinations, values.variants)) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "regenerate" });
    }
    if (!values.variants.some((variant) => variant.isActive))
      ctx.addIssue({ code: "custom", path: ["variants"], message: "activeVariant" });
    values.variants.forEach((variant, index) => {
      if (variant.stock < (variant.reservedQuantity ?? 0))
        ctx.addIssue({
          code: "custom",
          path: ["variants", index, "stock"],
          message: "reservedStock",
        });
      const result = variantSchema.safeParse(variant);
      if (!result.success)
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, ...issue.path],
            message: issue.message,
          }),
        );
    });
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function toAttributes(attributes: ProductFormValues["attributes"]): ProductAttribute[] {
  return attributes.map((attribute) => ({
    ...attribute,
    name: attribute.name.trim(),
    values: attribute.values.map(({ value }) => value.trim()),
  }));
}

export function productDefaults(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    type: product?.type ?? "simple",
    status: product?.status ?? "draft",
    images: product?.images.map((url) => ({ url })) ?? [],
    attributes:
      product?.attributes.map((attribute) => ({
        ...attribute,
        values: attribute.values.map((value) => ({ value })),
      })) ?? [],
    price: product?.type === "simple" ? product.price : 0,
    costPrice: product?.type === "simple" ? (product.costPrice ?? null) : null,
    stock: product?.type === "simple" ? product.stock : 0,
    trackInventory: product?.type === "simple" ? (product.trackInventory ?? true) : true,
    reservedQuantity: product?.type === "simple" ? (product.reservedQuantity ?? 0) : 0,
    lowStockThreshold: product?.type === "simple" ? (product.lowStockThreshold ?? 5) : 5,
    variants:
      product?.type === "variable"
        ? product.variants.map((variant) => ({
            ...variant,
            costPrice: variant.costPrice ?? null,
            trackInventory: variant.trackInventory ?? true,
            reservedQuantity: variant.reservedQuantity ?? 0,
            lowStockThreshold: variant.lowStockThreshold ?? 5,
            sku: variant.sku ?? "",
          }))
        : [],
  };
}

export function toProduct(
  values: ProductFormValues,
  identity: Pick<Product, "id" | "createdAt">,
): Product {
  const base = {
    ...identity,
    name: values.name.trim(),
    description: values.description.trim(),
    sku: values.sku.trim() || undefined,
    images: values.images.map(({ url }) => url.trim()),
    status: values.status,
    attributes: toAttributes(values.attributes).map((attribute) => ({
      ...attribute,
      useForVariants: values.type === "variable" && attribute.useForVariants,
    })),
  };
  return values.type === "simple"
    ? {
        ...base,
        type: "simple",
        price: values.price,
        costPrice: values.costPrice,
        stock: values.stock,
        trackInventory: values.trackInventory ?? true,
        reservedQuantity: values.reservedQuantity ?? 0,
        lowStockThreshold: values.lowStockThreshold ?? 5,
      }
    : {
        ...base,
        type: "variable",
        variants: values.variants.map((variant) => ({
          ...variant,
          sku: variant.sku?.trim() || undefined,
        })),
      };
}
