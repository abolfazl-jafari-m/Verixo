"use client";

import { useState, type Ref } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toAttributes, type ProductFormValues } from "../../schemas/product-schema";
import { combinationKey, reconcileVariants, variantCombinations } from "../../utils";
import { CostPriceInput, FieldError, FormInput } from "../product-form/form-fields";
import { ProductConfirmation } from "../product-confirmation/product-confirmation";
import type { ProductVariant } from "../../types";

export function VariantEditor({
  generationButtonRef,
}: {
  generationButtonRef: Ref<HTMLButtonElement>;
}) {
  const t = useTranslations("products");
  const {
    control,
    getValues,
    trigger,
    formState: { isSubmitting },
  } = useFormContext<ProductFormValues>();
  const { fields, replace } = useFieldArray({ control, name: "variants" });
  const attributes = useWatch({ control, name: "attributes" });
  const [generationError, setGenerationError] = useState<string>();
  const [pending, setPending] = useState<{ variants: ProductVariant[]; removed: number } | null>(
    null,
  );
  async function applyVariants(variants: ProductVariant[]) {
    replace(variants);
    setPending(null);
    await trigger("variants");
  }
  async function generate() {
    setGenerationError(undefined);
    if (!(await trigger("attributes"))) return;
    const current = getValues();
    try {
      const combinations = variantCombinations(toAttributes(current.attributes));
      if (!combinations.length) {
        setGenerationError(t("validation.variantAttributes"));
        return;
      }
      const keys = new Set(combinations.map(combinationKey));
      const removed = current.variants.filter(
        (variant) => !keys.has(combinationKey(variant.attributeValues)),
      ).length;
      const variants = reconcileVariants(combinations, current.variants, () => crypto.randomUUID());
      if (removed) setPending({ variants, removed });
      else await applyVariants(variants);
    } catch {
      setGenerationError(t("validation.variantLimit"));
    }
  }
  return (
    <section className="space-y-4" aria-labelledby="variants-heading">
      <h3 id="variants-heading" className="text-lg font-semibold">
        {t("variants")}
      </h3>
      <p className="text-muted-foreground text-sm">{t("variantsHint")}</p>
      <Button
        ref={generationButtonRef}
        type="button"
        variant="secondary"
        disabled={isSubmitting}
        onClick={generate}
      >
        {t("generate")}
      </Button>
      {generationError && (
        <p role="alert" className="text-destructive text-sm">
          {generationError}
        </p>
      )}
      <FieldError name="variants" />
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("variantCount", { count: fields.length })}
      </p>
      {fields.map((field, index) => (
        <fieldset
          key={field.id}
          className="bg-muted/25 ring-border/30 min-w-0 space-y-4 rounded-2xl p-4 ring-1 sm:p-5"
        >
          <legend className="text-muted-foreground max-w-full px-2 text-sm font-medium break-words">
            {Object.entries(field.attributeValues)
              .map(
                ([id, value]) =>
                  `${attributes.find((attribute) => attribute.id === id)?.name ?? t("removedAttribute")}: ${value}`,
              )
              .join(" / ")}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name={`variants.${index}.sku`} label={t("sku")} />
            <FormInput
              name={`variants.${index}.price`}
              label={t("priceLabel")}
              type="number"
              min="0"
              step="any"
              numeric
            />
            <FormInput
              name={`variants.${index}.stock`}
              label={t("stock")}
              type="number"
              min="0"
              step="1"
              numeric
            />
            <CostPriceInput name={`variants.${index}.costPrice`} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name={`variants.${index}.isActive`}
              render={({ field }) => (
                <Switch
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={isSubmitting}
                />
              )}
            />
            {t("variantActive")}
          </label>
        </fieldset>
      ))}
      <ProductConfirmation
        open={pending !== null}
        description={t("confirmRegenerate", { count: pending?.removed ?? 0 })}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void applyVariants(pending.variants);
        }}
      />
    </section>
  );
}
