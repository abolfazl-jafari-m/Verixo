"use client";

import { useId, useState } from "react";
import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductFormValues } from "../../schemas/product-schema";
import { FormInput } from "../product-form/form-fields";
import { AttributeValues } from "./attribute-values";
import type { AttributeRemoval } from "./attribute-editor";

interface AttributeCardProps {
  index: number;
  onRemove: () => void;
  requestRemoval: (request: AttributeRemoval) => void;
}

export function AttributeCard({ index, onRemove, requestRemoval }: AttributeCardProps) {
  const t = useTranslations("products");
  const { control } = useFormContext<ProductFormValues>();
  const attribute = useWatch({ control, name: `attributes.${index}` });
  const type = useWatch({ control, name: "type" });
  const { errors, isSubmitting } = useFormState({ control, name: `attributes.${index}` });
  const [expanded, setExpanded] = useState(index === 0 || !attribute.name.trim());
  const hasErrors = Boolean(errors.attributes?.[index]);
  const checkboxId = useId();
  const name = attribute.name.trim() || t("attributeNumber", { number: index + 1 });
  const locale = useLocale();

  return (
    <Accordion
      dir={locale === "fa" ? "rtl" : "ltr"}
      value={expanded || hasErrors ? ["attribute"] : []}
      onValueChange={(value: unknown[]) => setExpanded(value.includes("attribute"))}
      keepMounted
      className="border-border/40 bg-muted/15 rounded-2xl"
    >
      <AccordionItem value="attribute" className="data-open:bg-transparent">
        <div className="flex items-center gap-2 pe-2 [&>h3]:min-w-0 [&>h3]:flex-1">
          <AccordionTrigger
            data-attribute-trigger
            className="focus-visible:ring-ring min-h-14 items-center gap-3 rounded-xl hover:no-underline focus-visible:ring-2"
          >
            <span className="min-w-0 space-y-1">
              <span className="block break-words">{name}</span>
              <span className="text-muted-foreground block text-xs font-normal">
                {t("attributeSummary", {
                  count: attribute.values.length,
                  kind: t(
                    type === "variable" && attribute.useForVariants
                      ? "variantAttribute"
                      : "descriptiveAttribute",
                  ),
                })}
              </span>
              {hasErrors && (
                <span className="text-destructive block text-xs">{t("attributeHasErrors")}</span>
              )}
            </span>
          </AccordionTrigger>
          <Button
            type="button"
            variant="ghost"
            className="size-11 shrink-0"
            aria-label={t("removeAttribute", { number: index + 1 })}
            disabled={isSubmitting}
            onClick={onRemove}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
        <AccordionContent className="h-auto space-y-4" onFocusCapture={() => setExpanded(true)}>
          <FormInput name={`attributes.${index}.name`} label={t("attributeName")} />
          {type === "variable" && (
            <div className="flex min-h-11 items-center gap-3">
              <Controller
                control={control}
                name={`attributes.${index}.useForVariants`}
                render={({ field }) => (
                  <Checkbox
                    id={checkboxId}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={isSubmitting}
                  />
                )}
              />
              <label
                htmlFor={checkboxId}
                className="flex min-h-11 flex-1 cursor-pointer items-center text-sm"
              >
                {t("useForVariants")}
              </label>
            </div>
          )}
          <AttributeValues index={index} requestRemoval={requestRemoval} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
