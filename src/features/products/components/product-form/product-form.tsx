"use client";
import { ActionSpinner, ActionFeedback } from "@/components/shared";

import { useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "../../types";
import {
  productDefaults,
  productFormSchema,
  toProduct,
  type ProductFormValues,
} from "../../schemas/product-schema";
import { AttributeEditor } from "../attribute-editor/attribute-editor";
import { VariantEditor } from "../variant-editor/variant-editor";
import { controlClass, CostPriceInput, FormInput, FormSelect } from "./form-fields";
import { ProductConfirmation } from "../product-confirmation/product-confirmation";

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const t = useTranslations("products");
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productDefaults(product),
    mode: "onChange",
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
  } = form;
  const type = useWatch({ control, name: "type" });
  const images = useFieldArray({ control, name: "images" });
  const [saveError, setSaveError] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const generationButtonRef = useRef<HTMLButtonElement>(null);
  async function submit(values: ProductFormValues) {
    setSaveError(false);
    try {
      await onSave(
        toProduct(
          values,
          product ?? { id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ),
      );
    } catch {
      setSaveError(true);
    }
  }
  return (
    <FormProvider {...form}>
      <form
        className="space-y-8 px-4 pb-4 sm:px-6"
        noValidate
        onSubmit={handleSubmit(submit)}
        aria-busy={isSubmitting}
      >
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name="name" label={t("name")} maxLength={200} />
            <FormInput name="sku" label={t("sku")} />
            <FormSelect
              name="type"
              label={t("type")}
              options={(["simple", "variable"] as const).map((value) => ({
                value,
                label: t(`types.${value}`),
              }))}
            />
            <FormSelect
              name="status"
              label={t("status")}
              options={(["active", "draft", "archived"] as const).map((value) => ({
                value,
                label: t(`statuses.${value}`),
              }))}
            />
          </div>
          <p className="text-muted-foreground text-sm">{t("typeHint")}</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="product-description" className="text-sm font-medium">
              {t("description")}
            </label>
            <textarea
              id="product-description"
              rows={3}
              className={controlClass}
              {...register("description")}
            />
          </div>
          <section className="space-y-3" aria-labelledby="images-heading">
            <h3 id="images-heading" className="text-lg font-semibold">
              {t("images")}
            </h3>
            <p className="text-muted-foreground text-sm">{t("imagesHint")}</p>
            {images.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <FormInput
                    name={`images.${index}.url`}
                    label={t("imageNumber", { number: index + 1 })}
                    type="url"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-7"
                  aria-label={t("removeImage", { number: index + 1 })}
                  onClick={() => images.remove(index)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={() => images.append({ url: "" })}>
              <Plus aria-hidden="true" />
              {t("addImage")}
            </Button>
          </section>
          {type === "simple" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                name="price"
                label={t("priceLabel")}
                numeric
                type="number"
                min="0"
                step="any"
              />
              <FormInput name="stock" label={t("stock")} numeric type="number" min="0" step="1" />
              <CostPriceInput name="costPrice" />
            </div>
          )}
          <AttributeEditor
            onReviewVariants={() => {
              generationButtonRef.current?.scrollIntoView({ block: "center" });
              generationButtonRef.current?.focus({ preventScroll: true });
            }}
          />
          {type === "variable" && <VariantEditor generationButtonRef={generationButtonRef} />}
        </fieldset>
        {Object.keys(errors).length > 0 && (
          <p className="text-destructive text-sm" role="alert">
            {t("validation.summary")}
          </p>
        )}
        {saveError && <ActionFeedback kind="error" message={t("saveError")} />}
        <div className="bg-popover/95 sticky bottom-0 flex flex-wrap justify-end gap-3 py-4 backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => {
              if (isDirty) setConfirmDiscard(true);
              else onCancel();
            }}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <ActionSpinner />}
            {t(isSubmitting ? "saving" : "save")}
          </Button>
        </div>
      </form>
      <ProductConfirmation
        open={confirmDiscard}
        description={t("discard")}
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={onCancel}
      />
    </FormProvider>
  );
}
