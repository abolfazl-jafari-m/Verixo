import { z } from "zod";
import type { Product } from "@/features/products/types";
import { selectedProduct } from "../utils";

export function createOrderFormSchema(products: Product[]) {
  return z
    .object({
      notes: z.string().trim().max(1000, "tooLong"),
      payment: z.enum(["pending", "paid"]),
      shipping: z
        .number({ error: "amount" })
        .finite("amount")
        .min(0, "amount")
        .max(100000000, "amount"),
      lines: z
        .array(
          z.object({
            productId: z.string().min(1, "product"),
            variantId: z.string(),
            quantity: z
              .number({ error: "quantity" })
              .int("quantity")
              .min(1, "quantity")
              .max(10000, "quantity"),
          }),
        )
        .min(1, "emptyProducts"),
    })
    .superRefine((values, context) => {
      const quantities = new Map<string, number>();
      values.lines.forEach((line) => {
        const key = `${line.productId}:${line.variantId}`;
        quantities.set(key, (quantities.get(key) ?? 0) + line.quantity);
      });
      values.lines.forEach((line, index) => {
        const product = products.find((item) => item.id === line.productId);
        const selection = selectedProduct(product, line.variantId);
        if (!selection)
          context.addIssue({
            code: "custom",
            path: ["lines", index, product?.type === "variable" ? "variantId" : "productId"],
            message: product?.type === "variable" ? "variant" : "product",
          });
        else if ((quantities.get(`${line.productId}:${line.variantId}`) ?? 0) > selection.stock)
          context.addIssue({
            code: "custom",
            path: ["lines", index, "quantity"],
            message: "stock",
          });
      });
    });
}
export type OrderFormValues = z.infer<ReturnType<typeof createOrderFormSchema>>;
