"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext, useFormState, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "../../schemas/product-schema";
import { ProductSelect } from "../product-select/product-select";

export const controlClass =
  "bg-input/50 focus-visible:ring-ring/30 min-h-10 w-full min-w-0 rounded-2xl border border-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3";

export function FieldError({ name }: { name: FieldPath<ProductFormValues> }) {
  const t = useTranslations("products.validation");
  const { getFieldState } = useFormContext<ProductFormValues>();
  const state = useFormState<ProductFormValues>();
  const error = getFieldState(name, state).error;
  const message = error?.message ?? error?.root?.message;
  return message ? (
    <p id={`${name}-error`} className="text-destructive text-sm" role="alert">
      {t(message)}
    </p>
  ) : null;
}

export function FormInput({
  name,
  label,
  numeric = false,
  action,
  ...props
}: Omit<ComponentProps<"input">, "name"> & {
  name: FieldPath<ProductFormValues>;
  label: string;
  numeric?: boolean;
  action?: ReactNode;
}) {
  const { register, getFieldState } = useFormContext<ProductFormValues>();
  const state = useFormState<ProductFormValues>();
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          {...props}
          id={id}
          className="h-10"
          aria-invalid={Boolean(getFieldState(name, state).error)}
          aria-describedby={getFieldState(name, state).error ? `${name}-error` : undefined}
          {...register(name, { valueAsNumber: numeric })}
        />
        {action}
      </div>
      <FieldError name={name} />
    </div>
  );
}

export function FormSelect({
  name,
  label,
  options,
}: {
  name: "type" | "status";
  label: string;
  options: { value: string; label: string }[];
}) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<ProductFormValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ProductSelect
          label={label}
          name={field.name}
          value={field.value}
          options={options}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          disabled={isSubmitting}
        />
      )}
    />
  );
}

export function CostPriceInput({ name }: { name: "costPrice" | `variants.${number}.costPrice` }) {
  const t = useTranslations("products");
  const { control } = useFormContext<ProductFormValues>();
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={id} className="text-sm font-medium">
            {t("costPriceLabel")}
          </label>
          <Input
            id={id}
            name={field.name}
            ref={field.ref}
            type="number"
            min={0}
            step={1}
            className="h-10"
            value={field.value ?? ""}
            onChange={(event) =>
              field.onChange(event.target.value === "" ? null : event.target.valueAsNumber)
            }
            onBlur={field.onBlur}
            aria-invalid={!!fieldState.error}
            aria-describedby={`${id}-hint${fieldState.error ? ` ${name}-error` : ""}`}
          />
          <p id={`${id}-hint`} className="text-muted-foreground text-xs leading-5">
            {t("costPriceHint")}
          </p>
          <FieldError name={name} />
        </div>
      )}
    />
  );
}
