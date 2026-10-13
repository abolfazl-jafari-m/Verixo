"use client";

import { useId, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toAttributes, type ProductFormValues } from "../../schemas/product-schema";
import { variantCombinations, variantsMatch } from "../../utils";
import { ProductConfirmation } from "../product-confirmation/product-confirmation";
import { AttributeCard } from "./attribute-card";

export interface AttributeRemoval {
  description: string;
  needsConfirmation: boolean;
  remove: () => void;
  focus: () => HTMLElement | false;
}

export function AttributeEditor({ onReviewVariants }: { onReviewVariants: () => void }) {
  const t = useTranslations("products");
  const {
    control,
    getValues,
    trigger,
    formState: { isSubmitting },
  } = useFormContext<ProductFormValues>();
  const type = useWatch({ control, name: "type" });
  const attributes = useWatch({ control, name: "attributes" });
  const variants = useWatch({ control, name: "variants" });
  const { fields, append, remove } = useFieldArray({ control, name: "attributes" });
  const [pending, setPending] = useState<AttributeRemoval | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const finalFocus = useRef<AttributeRemoval["focus"] | null>(null);
  const locale = useLocale();
  const headingId = useId();
  let variantNotice: "variantsOutdated" | "validation.variantLimit" | null = null;
  if (type === "variable") {
    try {
      const combinations = variantCombinations(toAttributes(attributes));
      if (variants.length && !variantsMatch(combinations, variants))
        variantNotice = "variantsOutdated";
    } catch {
      variantNotice = "validation.variantLimit";
    }
  }

  function executeRemoval(request: AttributeRemoval) {
    if (isSubmitting) return;
    finalFocus.current = request.focus;
    request.remove();
    setPending(null);
    void trigger(type === "variable" ? ["attributes", "variants"] : "attributes");
    // Wait for the removed controls to leave the DOM before finding the next target.
    requestAnimationFrame(() => {
      const target = request.focus();
      if (target) target.focus();
    });
  }

  function requestRemoval(request: AttributeRemoval) {
    if (isSubmitting) return;
    finalFocus.current = null;
    if (request.needsConfirmation) setPending(request);
    else executeRemoval(request);
  }

  function removeAttribute(index: number) {
    const attribute = getValues(`attributes.${index}`);
    const affectsVariants =
      type === "variable" &&
      variants.some((variant) => Object.hasOwn(variant.attributeValues, attribute.id));
    requestRemoval({
      description: t(affectsVariants ? "removeVariantAttributeConfirm" : "removeAttributeConfirm", {
        name: attribute.name.trim() || t("attributeNumber", { number: index + 1 }),
      }),
      needsConfirmation:
        affectsVariants ||
        Boolean(attribute.name.trim()) ||
        attribute.values.some(({ value }) => Boolean(value.trim())),
      remove: () => remove(index),
      focus: () => {
        const next = Math.min(index, getValues("attributes").length - 1);
        return (
          sectionRef.current?.querySelectorAll<HTMLButtonElement>("[data-attribute-trigger]")[
            next
          ] ??
          addButtonRef.current ??
          false
        );
      },
    });
  }

  return (
    <section
      ref={sectionRef}
      className="space-y-4"
      aria-labelledby={headingId}
      onBlurCapture={() => {
        void trigger(type === "variable" ? ["attributes", "variants"] : "attributes");
      }}
    >
      <h3 id={headingId} className="text-lg font-semibold">
        {t("attributes")}
      </h3>
      <p className="text-muted-foreground text-sm">
        {t(type === "variable" ? "attributesHint" : "descriptiveAttributesHint")}
      </p>
      {variantNotice && (
        <div
          dir={locale === "fa" ? "rtl" : "ltr"}
          role="status"
          className="bg-warning-50 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200 space-y-2 rounded-xl p-3 text-sm"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t(variantNotice)}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            disabled={isSubmitting}
            onClick={onReviewVariants}
          >
            {t("reviewVariants")}
          </Button>
        </div>
      )}
      {fields.map((field, index) => (
        <AttributeCard
          // Nested useFieldArray paths must be remounted when an earlier attribute is removed.
          key={`${field.id}:${index}`}
          index={index}
          onRemove={() => removeAttribute(index)}
          requestRemoval={requestRemoval}
        />
      ))}
      <Button
        ref={addButtonRef}
        type="button"
        variant="ghost"
        className="h-11"
        disabled={isSubmitting}
        onClick={() =>
          append(
            { id: crypto.randomUUID(), name: "", values: [{ value: "" }], useForVariants: false },
            { focusName: `attributes.${fields.length}.name` },
          )
        }
      >
        <Plus aria-hidden="true" />
        {t("addAttribute")}
      </Button>
      <ProductConfirmation
        open={pending !== null}
        description={pending?.description ?? ""}
        onCancel={() => {
          finalFocus.current = null;
          setPending(null);
        }}
        onConfirm={() => {
          if (pending) executeRemoval(pending);
        }}
        finalFocus={() => finalFocus.current?.() ?? true}
      />
    </section>
  );
}
