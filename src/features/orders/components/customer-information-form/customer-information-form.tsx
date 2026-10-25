"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormatter, useTranslations } from "next-intl";
import { CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "../../schemas/customer-information-schema";
import { shippingMethods } from "../../types";
import { orderTotals } from "../../utils";
import { useOrdersStore } from "../orders-provider/orders-provider";

const fields = [
  { name: "name", autoComplete: "name", required: true },
  { name: "phone", autoComplete: "tel", required: true },
  { name: "province", autoComplete: "address-level1", required: false },
  { name: "city", autoComplete: "address-level2", required: true },
  { name: "address", autoComplete: "street-address", required: true },
  { name: "postalCode", autoComplete: "postal-code", required: false },
  { name: "deliveryNotes", autoComplete: "off", required: false },
] as const;

export function CustomerInformationForm({ token }: { token: string }) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const orders = useOrdersStore((state) => state.orders);
  const ready = useOrdersStore((state) => state.ready);
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  const submitCustomerInformation = useOrdersStore((state) => state.submitCustomerInformation);
  const [submissionFailed, setSubmissionFailed] = useState(false);
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      province: "",
      city: "",
      address: "",
      postalCode: "",
      deliveryNotes: "",
    },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  const order = orders.find((item) => item.customerFormToken === token);
  if (!ready)
    return (
      <p role="status" className="p-6 text-center">
        {t("customerFlow.loading")}
      </p>
    );
  if (!order || order.payment !== "paid")
    return (
      <p role="alert" className="bg-card border-border/50 rounded-2xl border p-6 text-sm leading-7">
        {t("customerFlow.unavailable")}
      </p>
    );
  if (order.customerInformationStatus === "submitted")
    return (
      <section
        role="status"
        className="bg-card border-border/50 flex flex-col items-center gap-4 rounded-2xl border p-6 text-center sm:p-10"
      >
        <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-300" />
        <h2 className="text-xl font-semibold">{t("customerFlow.successTitle")}</h2>
        <p className="text-muted-foreground text-sm leading-7">{t("customerFlow.success")}</p>
        <bdi className="font-mono text-sm">{order.number}</bdi>
        {order.shippingMethod && (
          <p className="text-sm">
            {t("customerFlow.shippingMethod")}:{" "}
            {t(`customerFlow.methods.${order.shippingMethod}.label`)}
          </p>
        )}
        <p className="text-muted-foreground text-xs leading-6">
          {t(storageAvailable ? "customerFlow.localOnly" : "customerFlow.storageUnavailable")}
        </p>
      </section>
    );
  const totals = orderTotals(order.lines, order.shipping);
  return (
    <div className="space-y-5">
      <section className="bg-card border-border/50 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Package className="text-primary size-5" />
            {t("orderSummary")}
          </h2>
          <bdi className="text-muted-foreground font-mono text-sm">{order.number}</bdi>
        </div>
        <ul className="divide-border/50 divide-y">
          {order.lines.map((line, index) => (
            <li
              key={`${line.productId}-${index}`}
              className="flex items-start justify-between gap-4 py-3 text-sm"
            >
              <span className="min-w-0 break-words">
                {line.name}
                {line.variantLabel && (
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {line.variantLabel}
                  </span>
                )}
              </span>
              <span className="shrink-0">{t("itemCount", { count: line.quantity })}</span>
            </li>
          ))}
        </ul>
        <p className="border-border/50 flex flex-wrap justify-between gap-2 border-t pt-4 text-sm">
          <span>{t("total")}</span>
          <strong>
            {f.number(totals.total)} {t("currency")}
          </strong>
        </p>
      </section>
      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          setSubmissionFailed(!submitCustomerInformation(token, values)),
        )}
        className="bg-card border-border/50 space-y-6 rounded-2xl border p-5 sm:p-6"
      >
        <h2 className="font-semibold">{t("customer")}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map(({ name, autoComplete, required }) => {
            const multiline = name === "address" || name === "deliveryNotes";
            const errorId = `customer-${name}-error`;
            const inputProps = {
              id: `customer-${name}`,
              autoComplete,
              ...register(name),
              "aria-required": required,
              "aria-invalid": !!errors[name],
              "aria-describedby": errors[name] ? errorId : undefined,
            };
            return (
              <div key={name} className={cn("space-y-2", multiline && "sm:col-span-2")}>
                <label htmlFor={inputProps.id} className="block text-sm font-medium">
                  {t(`customerFlow.fields.${name}`)}
                  {required && (
                    <span aria-hidden="true" className="text-destructive ms-1">
                      *
                    </span>
                  )}
                </label>
                {multiline ? (
                  <textarea
                    {...inputProps}
                    rows={3}
                    className="bg-input/50 border-border/50 focus-visible:ring-ring aria-invalid:border-destructive w-full resize-y rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                  />
                ) : (
                  <Input
                    {...inputProps}
                    type={name === "phone" ? "tel" : "text"}
                    inputMode={name === "postalCode" ? "numeric" : undefined}
                    dir={name === "phone" || name === "postalCode" ? "ltr" : undefined}
                    className="h-11 rounded-xl"
                  />
                )}
                {errors[name]?.message && (
                  <p id={errorId} role="alert" className="text-destructive text-xs">
                    {t(`errors.${errors[name].message}`)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{t("customerFlow.shippingMethod")}</legend>
          <Controller
            control={control}
            name="shippingMethod"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                aria-label={t("customerFlow.shippingMethod")}
                aria-required
                aria-invalid={!!errors.shippingMethod}
                aria-describedby={errors.shippingMethod ? "shipping-method-error" : undefined}
                className="grid gap-3 sm:grid-cols-3"
              >
                {shippingMethods.map((method, index) => (
                  <label
                    key={method}
                    htmlFor={`shipping-${method}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                      field.value === method
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 hover:bg-muted/30",
                    )}
                  >
                    <RadioGroupItem
                      id={`shipping-${method}`}
                      value={method}
                      ref={index === 0 ? field.ref : undefined}
                      onBlur={field.onBlur}
                      className="mt-1"
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium">
                        {t(`customerFlow.methods.${method}.label`)}
                      </span>
                      <span className="text-muted-foreground block text-xs leading-5">
                        {t(`customerFlow.methods.${method}.description`)}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          {errors.shippingMethod && (
            <p id="shipping-method-error" role="alert" className="text-destructive mt-2 text-xs">
              {t("errors.shippingMethod")}
            </p>
          )}
        </fieldset>
        <p className="text-muted-foreground text-xs leading-6">{t("customerFlow.localOnly")}</p>
        {!storageAvailable && (
          <p role="alert" className="text-destructive text-sm">
            {t("customerFlow.storageUnavailable")}
          </p>
        )}
        {submissionFailed && (
          <p role="alert" className="text-destructive text-sm">
            {t("customerFlow.submitFailed")}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-h-12 w-full whitespace-normal">
          {t("customerFlow.submit")}
        </Button>
      </form>
    </div>
  );
}
