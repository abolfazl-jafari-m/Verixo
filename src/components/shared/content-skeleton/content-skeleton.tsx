"use client";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
export function ContentSkeleton({
  variant = "table",
  page = false,
  columns = 5,
}: {
  variant?: "table" | "cards" | "board" | "form" | "document";
  page?: boolean;
  columns?: number;
}) {
  const t = useTranslations("appStates");
  return (
    <div
      role="status"
      aria-busy="true"
      className={page ? "space-y-6 p-4 pb-28 sm:p-6" : "space-y-4"}
    >
      <span className="sr-only">{t("loading")}</span>
      <div
        aria-hidden="true"
        className="space-y-5 [&_[data-slot=skeleton]]:motion-reduce:animate-none"
      >
        {page && (
          <>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
          </>
        )}
        {page && (variant === "table" || variant === "board") && (
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 min-w-40 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
        {variant === "form" ? (
          <div className="bg-card border-border/50 space-y-6 rounded-2xl border p-5 sm:p-6">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        ) : variant === "document" ? (
          <div className="bg-card border-border/50 space-y-8 rounded-2xl border p-5 sm:p-10">
            <div className="flex justify-between gap-6">
              <Skeleton className="size-16" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
            <Skeleton className="ms-auto h-24 w-1/2" />
          </div>
        ) : variant === "table" ? (
          <div className="border-border/50 overflow-hidden rounded-xl border">
            <Skeleton className="h-12 rounded-none" />
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex gap-6 border-t p-4">
                {Array.from({ length: columns }, (_, column) => (
                  <Skeleton
                    key={column}
                    className={
                      column > 2 ? "hidden h-5 min-w-0 flex-1 sm:block" : "h-5 min-w-0 flex-1"
                    }
                  />
                ))}
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t p-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ) : (
          <div
            className={
              variant === "board"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {Array.from({ length: variant === "board" ? 5 : 6 }, (_, i) => (
              <div key={i} className="border-border/50 space-y-4 rounded-2xl border p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-32" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
