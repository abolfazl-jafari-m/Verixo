"use client";

import { statusPresentation } from "../../status-presentation";

import { useLocale, useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { canMoveOrder } from "../../mock-workflow";
import { CustomerFormLink } from "../customer-form-link/customer-form-link";
import { cn } from "@/lib/utils";
import { orderStatuses, type Order, type OrderStatus } from "../../types";

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
            className="text-muted-foreground size-8 rounded-lg"
            aria-label={t("actionsFor", { number: order.number })}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        dir={locale === "fa" ? "rtl" : "ltr"}
        align="end"
        className="w-64 gap-1 rounded-xl p-2"
      >
        <CustomerFormLink order={order} />
        <p className="text-muted-foreground px-2 py-1 text-xs font-medium">{t("moveTo")}</p>
        {orderStatuses
          .filter((status) => status !== order.status)
          .map((status) => (
            <Button
              key={status}
              variant="ghost"
              className="h-10 justify-start"
              disabled={!canMoveOrder(order, status)}
              onClick={() => onMove(status)}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-md",
                  statusPresentation[status].badge,
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
              </span>
              {t(statusPresentation[status].label)}
            </Button>
          ))}
      </PopoverContent>
    </Popover>
  );
}
