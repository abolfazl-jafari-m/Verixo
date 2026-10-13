"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { orderStatuses, type OrderStatus } from "../../types";
import { statusPresentation } from "../../status-presentation";

export function OrderProgress({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders");
  return (
    <section aria-label={t("fulfillment")} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("fulfillment")}</h3>
        <span
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium",
            statusPresentation[status].badge,
          )}
        >
          {t(statusPresentation[status].label)}
        </span>
      </div>
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {orderStatuses.map((stage) => {
          const Icon = statusPresentation[stage].icon;
          return (
            <li
              key={stage}
              aria-current={stage === status ? "step" : undefined}
              className="flex min-w-0 flex-col items-center gap-2 text-center"
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl sm:size-11",
                  stage === status
                    ? statusPresentation[stage].badge
                    : "bg-muted/40 text-muted-foreground/50",
                )}
              >
                <Icon className="size-4 sm:size-5" />
              </span>
              <span
                className={cn(
                  "text-[10px] leading-5 sm:text-xs",
                  stage === status ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
              >
                {t(statusPresentation[stage].label)}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-muted-foreground text-xs">{t(`stageHints.${status}`)}</p>
    </section>
  );
}
