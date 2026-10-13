"use client";

import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}
export function OrderSelect({
  id,
  label,
  value,
  options,
  onChange,
  invalid,
  describedBy,
}: OrderSelectProps) {
  const locale = useLocale();
  return (
    <div className="flex min-w-0 flex-col gap-2">
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
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={invalid}
          aria-describedby={describedBy}
        >
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
