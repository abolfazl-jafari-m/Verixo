"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function OrderDateFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  // The filter stores a Gregorian day key; the UI always displays the Persian calendar.
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  const label = selected
    ? new Intl.DateTimeFormat(locale, {
        calendar: "persian",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(selected)
    : t("chooseDate");
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor="order-date" className="text-sm font-medium">
        {t("fromDate")}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id="order-date"
              variant="outline"
              className="h-10 w-full justify-between gap-2 rounded-xl px-3 font-normal"
            />
          }
        >
          <span className="truncate">{label}</span>
          <CalendarDays className="text-muted-foreground size-4 shrink-0" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto max-w-[calc(100vw-2rem)] gap-0 rounded-2xl p-1"
          dir={locale === "fa" ? "rtl" : "ltr"}
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(day) => {
              onChange(
                day
                  ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
                  : "",
              );
              setOpen(false);
            }}
          />
          {selected && (
            <Button
              variant="ghost"
              className="m-2"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              {t("clearDate")}
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
