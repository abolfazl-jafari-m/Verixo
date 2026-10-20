"use client";
import { CancelOrderAction } from "../cancel-order-action/cancel-order-action";

import { statusPresentation } from "../../status-presentation";

import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { canMoveOrder } from "../../mock-workflow";
import { CustomerFormLink } from "../customer-form-link/customer-form-link";
import { cn } from "@/lib/utils";
import { fulfillmentStatuses, type Order, type OrderStatus } from "../../types";

export function OrderCardMenu({
  order,
  onMove,
}: {
  order: Order;
  onMove: (status: OrderStatus) => void;
}) {
  const t = useTranslations("orders");
  const locale = useLocale();
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted/70 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground size-8 rounded-xl transition-colors duration-200 motion-reduce:transition-none"
            aria-label={t("actionsFor", { number: order.number })}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        dir={locale === "fa" ? "rtl" : "ltr"}
        align="end"
        sideOffset={8}
        className="max-h-[min(var(--available-height),640px,80dvh)] w-72 max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto rounded-2xl p-1.5 shadow-xl duration-200 motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none"
      >
        <div className="border-border/40 mx-2 flex items-center justify-between gap-3 border-b px-1 py-3">
          <bdi className="text-xs font-semibold tabular-nums">{order.number}</bdi>
          <span
            className={cn(
              "rounded-lg px-2 py-1 text-[10px] font-medium",
              statusPresentation[order.status].badge,
            )}
          >
            {t(statusPresentation[order.status].label)}
          </span>
        </div>
        <div className="bg-muted/30 mx-1 mt-3 rounded-xl p-3">
          <CustomerFormLink order={order} />
        </div>
        <p className="text-muted-foreground px-3 pt-4 pb-2 text-[11px] font-medium">
          {t("moveTo")}
        </p>
        {fulfillmentStatuses
          .filter((status) => status !== order.status)
          .map((status) => {
            const Icon = statusPresentation[status].icon;
            return (
              <Button
                key={status}
                variant="ghost"
                className="hover:bg-muted/60 h-auto min-h-11 w-full justify-start gap-3 rounded-xl px-3 py-2 text-xs transition-colors duration-200 disabled:opacity-40 motion-reduce:transition-none"
                disabled={!canMoveOrder(order, status)}
                onClick={() => onMove(status)}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl",
                    statusPresentation[status].badge,
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex-1 text-start whitespace-normal">
                  {t(statusPresentation[status].label)}
                </span>
                <ChevronRight
                  className="text-muted-foreground/50 size-3.5 rtl:rotate-180"
                  aria-hidden="true"
                />
              </Button>
            );
          })}
        <CancelOrderAction order={order} placement="menu" />
      </PopoverContent>
    </Popover>
  );
}
