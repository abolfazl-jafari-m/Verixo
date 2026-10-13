"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductFilters as Filters } from "../../utils";
import { ProductSelect } from "../product-select/product-select";

export const emptyProductFilters: Filters = { search: "", type: "all", status: "all" };

export function ProductFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  const t = useTranslations("products");
  const hasFilters = filters.search !== "" || filters.type !== "all" || filters.status !== "all";
  return (
    <div className="grid grid-cols-2 items-end gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="col-span-2 flex flex-col gap-2 lg:col-span-1">
        <label htmlFor="product-search" className="text-muted-foreground text-xs font-medium">
          {t("search")}
        </label>
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute start-3 top-3 size-4"
            aria-hidden="true"
          />
          <Input
            id="product-search"
            type="search"
            className="bg-background border-border/60 h-10 rounded-xl ps-9 shadow-xs"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder={t("searchPlaceholder")}
          />
        </div>
      </div>
      <ProductSelect<Filters["type"]>
        label={t("type")}
        value={filters.type}
        onValueChange={(type) => onChange({ ...filters, type })}
        options={[
          { value: "all", label: t("allTypes") },
          { value: "simple", label: t("types.simple") },
          { value: "variable", label: t("types.variable") },
        ]}
      />
      <ProductSelect<Filters["status"]>
        label={t("status")}
        value={filters.status}
        onValueChange={(status) => onChange({ ...filters, status })}
        options={[
          { value: "all", label: t("allStatuses") },
          ...(["active", "draft", "archived"] as const).map((value) => ({
            value,
            label: t(`statuses.${value}`),
          })),
        ]}
      />
      <Button
        variant="ghost"
        className="col-span-2 h-10 justify-self-end lg:col-span-1"
        disabled={!hasFilters}
        onClick={() => onChange(emptyProductFilters)}
      >
        <X aria-hidden="true" />
        {t("clearFilters")}
      </Button>
    </div>
  );
}
