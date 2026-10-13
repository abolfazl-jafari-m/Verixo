"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatReportDate, previousRange } from "../../date-range";
import type { RangePreset } from "../../types";
import { useReport } from "../report-provider/report-provider";
import { ReportExports } from "../report-exports/report-exports";

export function ReportSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const locale = useLocale();
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Select
        value={value}
        items={options}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent dir={locale === "fa" ? "rtl" : "ltr"} alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (day: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const selected = new Date(`${value}T12:00:00`);
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
              aria-label={`${label}: ${formatReportDate(value, locale)}`}
            />
          }
        >
          <span>{formatReportDate(value, locale)}</span>
          <CalendarDays className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-1" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(day) => {
              if (day) {
                onChange(
                  `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`,
                );
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
const presets: RangePreset[] = [
  "today",
  "week",
  "month",
  "currentMonth",
  "previousMonth",
  "custom",
];
export function ReportFilters() {
  const { range, preset, selectPreset, setRange, compare, setCompare, report, storageAvailable } =
    useReport();
  const t = useTranslations("reports");
  const locale = useLocale();
  const previous = report ? previousRange(range) : null;
  return (
    <section className="space-y-4" aria-label={t("filters")}>
      <div className="bg-muted/40 text-muted-foreground rounded-xl px-4 py-3 text-xs leading-6">
        {t("demo")}
      </div>
      {!storageAvailable && (
        <p role="alert" className="text-destructive text-sm">
          {t("storageUnavailable")}
        </p>
      )}
      <div className="grid items-end gap-3 sm:grid-cols-3">
        <ReportSelect
          id="report-period"
          label={t("period")}
          value={preset}
          options={presets.map((value) => ({ value, label: t(`presets.${value}`) }))}
          onChange={(value) => {
            const next = presets.find((item) => item === value);
            if (next) selectPreset(next);
          }}
        />
        {preset === "custom" ? (
          <>
            <DateField
              label={t("from")}
              value={range.from}
              onChange={(from) => setRange({ ...range, from })}
            />
            <DateField
              label={t("to")}
              value={range.to}
              onChange={(to) => setRange({ ...range, to })}
            />
          </>
        ) : (
          <p className="text-muted-foreground pb-2 text-sm sm:col-span-2">
            {formatReportDate(range.from, locale)} — {formatReportDate(range.to, locale)}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              id="report-comparison"
              aria-label={t("compare")}
              checked={compare}
              onCheckedChange={setCompare}
            />
            <label htmlFor="report-comparison" className="text-sm">
              {t("compare")}
            </label>
          </div>
          {compare && previous && (
            <p className="text-muted-foreground text-xs">
              {formatReportDate(previous.from, locale)} — {formatReportDate(previous.to, locale)}
            </p>
          )}
        </div>
        <ReportExports />
      </div>
      <p className="text-muted-foreground text-xs leading-6">{t("periodHint")}</p>
    </section>
  );
}
