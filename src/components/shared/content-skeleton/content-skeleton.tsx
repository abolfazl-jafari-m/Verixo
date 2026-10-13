"use client";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
export function ContentSkeleton({
  variant = "table",
  page = false,
}: {
  variant?: "table" | "cards" | "board";
  page?: boolean;
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
        {variant === "table" ? (
          <div className="border-border/50 overflow-hidden rounded-xl border">
            <Skeleton className="h-12 rounded-none" />
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex gap-6 border-t p-4">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/5" />
              </div>
            ))}
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
