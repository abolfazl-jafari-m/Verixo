"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useFormatter, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/features/products/types";
import { selectedProduct } from "../../utils";
import type { OrderFormValues } from "../../schemas/order-schema";
import { OrderSelect } from "../order-select/order-select";

export function OrderProductRow({
  index,
  onRemove,
  products,
}: {
  index: number;
  onRemove: () => void;
  products: Product[];
}) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const line = useWatch({ control, name: `lines.${index}` });
  const product = products.find((item) => item.id === line.productId);
  const selection = selectedProduct(product, line.variantId);
  const error = errors.lines?.[index];
  const errorMessage =
    error?.quantity?.message ?? error?.variantId?.message ?? error?.productId?.message;
  const amount = selection && Number.isFinite(line.quantity) ? selection.price * line.quantity : 0;
  return (
    <div className="border-border/50 bg-background/50 space-y-3 rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{product?.name}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("removeProduct", { name: product?.name ?? "" })}
          onClick={onRemove}
        >
          <Trash2 className="text-muted-foreground size-4" />
        </Button>
      </div>
      <div className="grid items-end gap-3 sm:grid-cols-3">
        {product?.type === "variable" && (
          <Controller
            control={control}
            name={`lines.${index}.variantId`}
            render={({ field }) => (
              <OrderSelect
                id={`line-${index}-variant`}
                label={t("variant")}
                value={field.value}
                onChange={field.onChange}
                invalid={!!error?.variantId}
                describedBy={errorMessage ? `line-${index}-error` : undefined}
                options={[
                  { value: "", label: t("chooseVariant") },
                  ...product.variants
                    .filter((variant) => variant.isActive)
                    .map((variant) => ({
                      value: variant.id,
                      label: Object.values(variant.attributeValues).join(" / "),
                    })),
                ]}
              />
            )}
          />
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor={`line-${index}-quantity`} className="text-sm font-medium">
            {t("quantity")}
          </label>
          <Input
            id={`line-${index}-quantity`}
            type="number"
            min={1}
            step={1}
            className="h-10 rounded-xl"
            {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
            aria-invalid={!!error?.quantity}
            aria-describedby={errorMessage ? `line-${index}-error` : undefined}
          />
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground text-xs">{t("unitPrice")}</p>
          <p>
            {f.number(selection?.price ?? 0)} {t("currency")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {selection?.trackInventory === false
            ? t("untrackedInventory")
            : t("available", { count: selection?.stock ?? 0 })}
        </span>
        <span className="font-medium">
          {t("lineTotal")}: {f.number(amount)} {t("currency")}
        </span>
      </div>
      {errorMessage && (
        <p id={`line-${index}-error`} role="alert" className="text-destructive text-xs">
          {t(`errors.${errorMessage}`)}
        </p>
      )}
    </div>
  );
}
