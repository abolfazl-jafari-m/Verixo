"use client";

import { useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductFormValues } from "../../schemas/product-schema";
import { FieldError, FormInput } from "../product-form/form-fields";
import type { AttributeRemoval } from "./attribute-editor";

export function AttributeValues({
  index,
  requestRemoval,
}: {
  index: number;
  requestRemoval: (request: AttributeRemoval) => void;
}) {
  const t = useTranslations("products");
  const {
    control,
    getValues,
    formState: { isSubmitting },
  } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: `attributes.${index}.values` });
  const containerRef = useRef<HTMLDivElement>(null);

  function removeValue(valueIndex: number) {
    const attribute = getValues(`attributes.${index}`);
    if (attribute.values.length <= 1) return;
    const value = attribute.values[valueIndex].value;
    const affectsVariants =
      getValues("type") === "variable" &&
      getValues("variants").some(
        (variant) => variant.attributeValues[attribute.id] === value.trim(),
      );
    requestRemoval({
      description: t(affectsVariants ? "removeVariantValueConfirm" : "removeValueConfirm", {
        value: value.trim() || t("valueNumber", { number: valueIndex + 1 }),
      }),
      needsConfirmation: affectsVariants || Boolean(value.trim()),
      remove: () => remove(valueIndex),
      focus: () => {
        const next = Math.min(valueIndex, getValues(`attributes.${index}.values`).length - 1);
        return (
          containerRef.current?.querySelector<HTMLInputElement>(
            `input[name="attributes.${index}.values.${next}.value"]`,
          ) ?? false
        );
      },
    });
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field, valueIndex) => (
          <FormInput
            key={field.id}
            name={`attributes.${index}.values.${valueIndex}.value`}
            label={t("valueNumber", { number: valueIndex + 1 })}
            action={
              <Button
                type="button"
                variant="ghost"
                className="size-11 shrink-0"
                aria-label={t("removeValue", { number: valueIndex + 1 })}
                title={fields.length === 1 ? t("keepOneValue") : undefined}
                disabled={isSubmitting || fields.length === 1}
                onClick={() => removeValue(valueIndex)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            }
          />
        ))}
      </div>
      <FieldError name={`attributes.${index}.values`} />
      {fields.length === 1 && <p className="text-muted-foreground text-xs">{t("keepOneValue")}</p>}
      <Button
        type="button"
        variant="ghost"
        className="h-11"
        disabled={isSubmitting}
        onClick={() =>
          append({ value: "" }, { focusName: `attributes.${index}.values.${fields.length}.value` })
        }
      >
        <Plus aria-hidden="true" />
        {t("addValue")}
      </Button>
    </div>
  );
}
