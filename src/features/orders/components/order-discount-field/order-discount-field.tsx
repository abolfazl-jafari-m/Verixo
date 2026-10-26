"use client";

import type { Ref } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";

interface OrderDiscountFieldProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  discountAmount: number;
  invalid?: boolean;
  disabled?: boolean;
}
export function OrderDiscountField({
  id,
  value,
  onChange,
  onBlur,
  inputRef,
  discountAmount,
  invalid,
  disabled,
}: OrderDiscountFieldProps) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const locale = useLocale();
  const direction = locale === "fa" ? "rtl" : "ltr";
  const percent = (amount: number) =>
    f.number(amount / 100, { style: "percent", maximumFractionDigits: 2 });
  return (
    <DirectionProvider direction={direction}>
      <div className="min-w-0 space-y-2" dir={direction}>
        <div className="flex items-center justify-between gap-3">
          <span id={id + "-label"} className="text-sm font-medium">
            {t("discount")}
          </span>
          <output
            className="text-primary text-lg font-semibold tabular-nums"
            aria-labelledby={id + "-label"}
          >
            {percent(value)}
          </output>
        </div>
        <Slider
          id={id}
          name="discountPercentage"
          value={[value]}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          locale={locale}
          aria-labelledby={id + "-label"}
          aria-invalid={invalid}
          onValueChange={(next) => onChange(typeof next === "number" ? next : next[0])}
          className="[&_[data-slot=slider-thumb]]:size-5 [&>div]:min-h-11"
          thumbProps={{
            inputRef,
            onBlur,
            "aria-describedby": id + "-amount" + (invalid ? " " + id + "-error" : ""),
            getAriaValueText: (_, amount) => percent(amount),
          }}
        />
        <div
          className="text-muted-foreground flex justify-between text-xs tabular-nums"
          aria-hidden="true"
        >
          <span>{percent(0)}</span>
          <span>{percent(100)}</span>
        </div>
        <p id={id + "-amount"} className="text-muted-foreground text-sm">
          {t("discount")}: {f.number(-discountAmount)} {t("currency")}
        </p>
        {invalid && (
          <p id={id + "-error"} role="alert" className="text-destructive text-xs">
            {t("errors.discount")}
          </p>
        )}
      </div>
    </DirectionProvider>
  );
}
