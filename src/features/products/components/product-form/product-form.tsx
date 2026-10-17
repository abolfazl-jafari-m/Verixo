"use client";
import { ActionSpinner, ActionFeedback } from "@/components/shared";

import { useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { InventoryFields } from "./inventory-fields";
import { ProductImageUpload } from "../product-image-upload/product-image-upload";
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
  const [imagesBusy, setImagesBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [pendingStockSave, setPendingStockSave] = useState<ProductFormValues | null>(null);
  const saving = useRef(false);
  const generationButtonRef = useRef<HTMLButtonElement>(null);
  async function submit(values: ProductFormValues) {
    if (saving.current) return;
    saving.current = true;
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
    } finally {
      saving.current = false;
    }
  }
  return (
    <FormProvider {...form}>
      <form
        className="space-y-8 px-4 pb-4 sm:px-6"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(async (values) => {
            if (imagesBusy) return;
            const stockChanged =
              product &&
              (product.type !== values.type ||
                (product.type === "simple"
                  ? product.stock !== values.stock
                  : product.variants.some(
                      (variant) =>
                        values.variants.find((item) => item.id === variant.id)?.stock !==
                        variant.stock,
                    )));
            if (stockChanged) setPendingStockSave(values);
            else await submit(values);
          })(event);
        }}
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
          <ProductImageUpload onBusyChange={setImagesBusy} />
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
              <InventoryFields />
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
            disabled={isSubmitting || imagesBusy}
            onClick={() => {
              if (isDirty) setConfirmDiscard(true);
              else onCancel();
            }}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting || imagesBusy} aria-busy={isSubmitting}>
            {isSubmitting && <ActionSpinner />}
            {t(isSubmitting ? "saving" : "save")}
          </Button>
        </div>
      </form>
      <ProductConfirmation
        open={pendingStockSave !== null}
        description={t("confirmStockSave")}
        onCancel={() => setPendingStockSave(null)}
        onConfirm={() => {
          if (pendingStockSave) {
            const values = pendingStockSave;
            setPendingStockSave(null);
            void handleSubmit(() => submit(values))();
          }
        }}
      />
      <ProductConfirmation
        open={confirmDiscard}
        description={t("discard")}
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={onCancel}
      />
    </FormProvider>
  );
}
