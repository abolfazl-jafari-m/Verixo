"use client";
import { ActionSpinner } from "@/components/shared";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { invoiceShowsPaymentDetails } from "../../payment-information";
import { Input } from "@/components/ui/input";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { OrderDiscountField } from "@/features/orders/components/order-discount-field/order-discount-field";
import { orderTotals } from "@/features/orders/utils";
import { invoiceEditSchema, type InvoiceEditValues } from "../../schemas/invoice-schema";
import type { Invoice } from "../../types";

export function InvoiceEditor({
  invoice,
  onDone,
  onCancel,
}: {
  invoice: Invoice;
  onDone: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("invoices");
  const f = useFormatter();
  const updateInvoice = useOrdersStore((state) => state.updateInvoice);
  const [failed, setFailed] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceEditValues>({
    resolver: zodResolver(invoiceEditSchema),
    defaultValues: {
      unitPrices: invoice.lines.map((line) => ({ value: line.unitPrice })),
      shipping: invoice.shipping,
      discountPercentage: invoice.discountPercentage ?? 0,
      showPaymentDetails: invoiceShowsPaymentDetails(
        invoice.settingsSnapshot.paymentInformation,
        invoice.showPaymentDetails,
      ),
    },
  });
  const prices = useWatch({ control, name: "unitPrices" });
  const discountPercentage = useWatch({ control, name: "discountPercentage" }) ?? 0;
  const shipping = useWatch({ control, name: "shipping" });
  const totals = orderTotals(
    invoice.lines.map((line, index) => ({
      ...line,
      unitPrice: Number.isFinite(prices[index]?.value) ? prices[index].value : 0,
    })),
    Number.isFinite(shipping) ? shipping : 0,
    Number.isFinite(discountPercentage) && discountPercentage >= 0 && discountPercentage <= 100
      ? discountPercentage
      : 0,
  );
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit((values) => {
        if (updateInvoice(invoice.orderId, values)) onDone();
        else setFailed(true);
      })}
    >
      <p className="bg-muted/30 text-muted-foreground rounded-xl p-3 text-xs leading-6">
        {t("editHint")}
      </p>
      <Controller
        control={control}
        name="showPaymentDetails"
        render={({ field }) => (
          <label className="flex items-center gap-3 text-sm">
            <Switch
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {t("showPaymentDetails")}
          </label>
        )}
      />
      <Controller
        control={control}
        name="discountPercentage"
        render={({ field, fieldState }) => (
          <OrderDiscountField
            id="invoice-discount"
            value={field.value ?? 0}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            discountAmount={totals.discountAmount}
            invalid={!!fieldState.error}
            disabled={isSubmitting}
          />
        )}
      />
      <div className="space-y-4">
        {invoice.lines.map((line, index) => (
          <div
            key={`${line.productId}-${index}`}
            className="border-border/50 grid items-center gap-3 border-b pb-4 sm:grid-cols-[1fr_180px]"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{line.name}</p>
              {line.variantLabel && (
                <p className="text-muted-foreground text-xs">{line.variantLabel}</p>
              )}
              <p className="text-muted-foreground text-xs">
                {t("quantity")}: {f.number(line.quantity)}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor={`invoice-price-${index}`} className="text-xs font-medium">
                {t("unitPrice")} ({t("currency")})
              </label>
              <Input
                id={`invoice-price-${index}`}
                type="number"
                min={0}
                max={100000000}
                step="any"
                {...register(`unitPrices.${index}.value`, { valueAsNumber: true })}
                aria-invalid={!!errors.unitPrices?.[index]?.value}
                aria-describedby={
                  errors.unitPrices?.[index]?.value ? `invoice-price-error-${index}` : undefined
                }
              />
              {errors.unitPrices?.[index]?.value && (
                <p
                  id={`invoice-price-error-${index}`}
                  role="alert"
                  className="text-destructive text-xs"
                >
                  {t("amountError")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label htmlFor="invoice-shipping" className="text-sm font-medium">
          {t("shipping")} ({t("currency")})
        </label>
        <Input
          id="invoice-shipping"
          type="number"
          min={0}
          max={100000000}
          step="any"
          {...register("shipping", { valueAsNumber: true })}
          aria-invalid={!!errors.shipping}
          aria-describedby={errors.shipping ? "invoice-shipping-error" : undefined}
        />
        {errors.shipping && (
          <p id="invoice-shipping-error" role="alert" className="text-destructive text-xs">
            {t("amountError")}
          </p>
        )}
      </div>
      <p className="flex flex-wrap justify-between gap-2 text-sm font-semibold">
        {t("total")}
        <span>
          {f.number(totals.total)} {t("currency")}
        </span>
      </p>
      {failed && (
        <p role="alert" className="text-destructive text-sm">
          {t("editFailed")}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting && <ActionSpinner />}
          {t("save")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
