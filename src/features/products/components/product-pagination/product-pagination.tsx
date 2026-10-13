"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSelect } from "../product-select/product-select";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ProductPagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProductPaginationProps) {
  const t = useTranslations("products");
  const format = useFormatter();
  return (
    <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-between gap-4">
      <div className="w-36">
        <ProductSelect
          label={t("pageSize")}
          value={pageSize}
          onValueChange={onPageSizeChange}
          options={[5, 10, 20].map((value) => ({ value, label: format.number(value) }))}
        />
      </div>
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {t("pageInfo", { page, total: totalPages, count })}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
          {t("previous")}
        </Button>
        <span
          className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg text-sm font-semibold tabular-nums"
          aria-hidden="true"
        >
          {format.number(page)}
        </span>
        <Button
          variant="ghost"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")}
          <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
