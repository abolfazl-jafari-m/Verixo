"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigations";
import { productService, productQueryKey } from "@/features/products/services/product-service";
import { inventorySummary } from "../../domain";

export function InventoryAlert() {
  const t = useTranslations("inventory");
  const query = useQuery({ queryKey: productQueryKey, queryFn: productService.list });
  if (!query.data || query.isError) return null;
  const summary = inventorySummary(query.data);
  if (!summary.low && !summary.out) return null;
  return (
    <Link
      href="/inventory?status=alerts"
      className="group border-border/40 bg-muted/25 hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <span className="bg-warning-500/10 text-warning-700 dark:text-warning-300 flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Package className="size-4" aria-hidden="true" />
      </span>
      <span className="text-foreground/80 min-w-0 flex-1 leading-6">
        {t("alert", { count: summary.low + summary.out })}
      </span>
      <ChevronRight
        className="text-muted-foreground/60 group-hover:text-foreground size-4 shrink-0 transition-colors motion-reduce:transition-none rtl:rotate-180"
        aria-hidden="true"
      />
    </Link>
  );
}
