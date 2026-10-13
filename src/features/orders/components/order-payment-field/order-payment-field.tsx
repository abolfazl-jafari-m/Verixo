"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { BadgeCheck, Clock3 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { OrderFormValues } from "../../schemas/order-schema";

export function OrderPaymentField() {
  const t = useTranslations("orders");
  const { control } = useFormContext<OrderFormValues>();
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-sm font-semibold">{t("payment")}</legend>
      <Controller
        control={control}
        name="payment"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            aria-label={t("payment")}
            className="gap-2"
          >
            {(["pending", "paid"] as const).map((payment) => {
              const Icon = payment === "paid" ? BadgeCheck : Clock3;
              return (
                <label
                  key={payment}
                  htmlFor={`payment-${payment}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                    field.value === payment
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/50 hover:bg-muted/30",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      field.value === payment ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="text-xs font-medium">{t(`payments.${payment}`)}</span>
                    <span className="text-muted-foreground text-[10px] leading-4">
                      {t(`paymentHints.${payment}`)}
                    </span>
                  </span>
                  <RadioGroupItem
                    id={`payment-${payment}`}
                    value={payment}
                    onBlur={field.onBlur}
                    ref={payment === "pending" ? field.ref : undefined}
                  />
                </label>
              );
            })}
          </RadioGroup>
        )}
      />
    </fieldset>
  );
}
