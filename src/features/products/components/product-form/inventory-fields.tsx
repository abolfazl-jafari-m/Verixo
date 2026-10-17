"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useFormatter, useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import type { ProductFormValues } from "../../schemas/product-schema";
import { FormInput } from "./form-fields";

export function InventoryFields({ index }: { index?: number }) {
  const t = useTranslations("inventory");
  const f = useFormatter();
  const { control } = useFormContext<ProductFormValues>();
  const prefix = index === undefined ? "" : (`variants.${index}.` as const);
  const stock = useWatch({ control, name: `${prefix}stock` });
  const reserved = useWatch({ control, name: `${prefix}reservedQuantity` }) ?? 0;
  const tracked = useWatch({ control, name: `${prefix}trackInventory` }) ?? true;
  return (
    <div className="bg-muted/25 col-span-full space-y-3 rounded-xl p-4">
      <label className="flex items-center gap-2 text-sm">
        <Controller
          control={control}
          name={`${prefix}trackInventory`}
          render={({ field }) => (
            <Switch
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={reserved > 0}
            />
          )}
        />
        {t("tracking")}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name={`${prefix}stock`}
          label={t("physical")}
          numeric
          type="number"
          min={reserved}
          step="1"
        />
        <FormInput
          name={`${prefix}lowStockThreshold`}
          label={t("threshold")}
          numeric
          type="number"
          min="0"
          step="1"
        />
      </div>
      <p className="text-sm">
        {t("reserved")}: {f.number(reserved)} · {t("available")}:{" "}
        {tracked && Number.isFinite(stock) ? f.number(stock - reserved) : t("untracked")}
      </p>
      <p className="text-muted-foreground text-xs">{t("adjustHint")}</p>
    </div>
  );
}
