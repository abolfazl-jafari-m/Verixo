"use client";

import { useId } from "react";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSelectProps<T extends string | number> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onValueChange: (value: T) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLButtonElement>;
}

export function ProductSelect<T extends string | number>({
  label,
  value,
  options,
  onValueChange,
  onBlur,
  name,
  disabled,
  inputRef,
}: ProductSelectProps<T>) {
  const id = useId();
  const locale = useLocale();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-muted-foreground text-xs font-medium">
        {label}
      </label>
      <Select
        items={options}
        value={value}
        onValueChange={(next) => {
          if (next !== null) onValueChange(next);
        }}
        name={name}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          ref={inputRef}
          onBlur={onBlur}
          className="w-full data-[size=default]:h-10"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          dir={locale === "fa" ? "rtl" : "ltr"}
          align="start"
          alignItemWithTrigger={false}
        >
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
