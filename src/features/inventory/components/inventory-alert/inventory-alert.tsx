"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Package, CircleCheck } from "lucide-react";
import { AppState, ActionSpinner } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigations";
import { productService, productQueryKey } from "@/features/products/services/product-service";
import { inventorySummary } from "../../domain";

export function InventoryAlert() {
  const t = useTranslations("inventory");
  const query = useQuery({ queryKey: productQueryKey, queryFn: productService.list });
  const states = useTranslations("appStates");
  if (query.isPending)
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">{t("loading")}</span>
        <Skeleton aria-hidden="true" className="h-16 rounded-xl" />
      </div>
    );
  if (query.isError)
    return (
      <AppState
        kind="error"
        className="flex-row flex-wrap justify-start py-4 text-start [&_h2]:text-sm"
        title={t("loadError")}
        action={
          <Button
            size="sm"
            variant="outline"
            disabled={query.isFetching}
            aria-busy={query.isFetching}
            onClick={() => query.refetch()}
          >
            {query.isFetching && <ActionSpinner />}
            {states("retry")}
          </Button>
        }
      />
    );
  const summary = inventorySummary(query.data);
  if (!summary.low && !summary.out)
    return (
      <div className="bg-muted/25 border-border/40 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
        <CircleCheck aria-hidden="true" className="text-primary size-5 shrink-0" />
        <p>{t(query.data.length ? "noAlerts" : "empty")}</p>
      </div>
    );
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
