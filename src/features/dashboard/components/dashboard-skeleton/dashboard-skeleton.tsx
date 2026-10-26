"use client";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
export function DashboardSkeleton() {
  const t = useTranslations("appStates");
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="border-border/50 space-y-4 rounded-2xl border p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="border-border/50 space-y-5 rounded-2xl border p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="border-border/50 space-y-4 rounded-2xl border p-5">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
