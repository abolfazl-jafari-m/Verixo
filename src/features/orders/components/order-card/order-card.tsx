"use client";
import { InventoryException } from "../inventory-exception/inventory-exception";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowLeft, GripVertical, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orderStatuses, type Order, type OrderStatus } from "../../types";
import { statusPresentation } from "../../status-presentation";
import { canMoveOrder } from "../../mock-workflow";
import { OrderCardMenu } from "../order-card-menu/order-card-menu";
import { OrderInvoiceDialog } from "../order-invoice-dialog/order-invoice-dialog";
import { OrderCardContent } from "./order-card-content";

const actionStyles: Partial<Record<OrderStatus, string>> = {
  pending_payment:
    "bg-success-50 text-success-800 hover:bg-success-100 dark:bg-success-900/25 dark:text-success-300 dark:hover:bg-success-900/40",
  paid: "bg-info-50 text-info-800 hover:bg-info-100 dark:bg-info-900/25 dark:text-info-300 dark:hover:bg-info-900/40",
  packaged:
    "bg-primary-50 text-primary-800 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:hover:bg-primary-900/50",
  courier:
    "bg-success-50 text-success-800 hover:bg-success-100 dark:bg-success-900/25 dark:text-success-300 dark:hover:bg-success-900/40",
};

interface OrderCardProps {
  order: Order;
  handle?: ReactNode;
  selection?: ReactNode;
  onOpen?: () => void;
  onMove?: (status: OrderStatus) => void;
}

export function OrderCard({ order, handle, selection, onOpen, onMove }: OrderCardProps) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const locale = useLocale();
  const nextStatus =
    order.status === "delivered" || order.status === "cancelled"
      ? undefined
      : orderStatuses[orderStatuses.indexOf(order.status) + 1];
  const presentation = statusPresentation[order.status];
  const pendingPayment = order.status === "pending_payment";
  return (
    <article
      data-order-status={order.status}
      className={cn(
        "group/card border-border/60 bg-card flex flex-col overflow-hidden rounded-xl border border-t-2 shadow-xs transition-shadow hover:shadow-md motion-reduce:transition-none",
        presentation.accent,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        {selection}
        <span
          dir="ltr"
          className="text-muted-foreground font-mono text-[11px] font-medium tracking-wide"
        >
          #{order.number}
        </span>
        <div className="flex items-center gap-1">
          {order.notes && (
            <span title={t("hasNote")} className="text-muted-foreground">
              <MessageSquare className="size-3.5" />
              <span className="sr-only">{t("hasNote")}</span>
            </span>
          )}
          {onMove && <OrderCardMenu order={order} onMove={onMove} />}
        </div>
      </div>
      {pendingPayment && (
        <time dateTime={order.createdAt} className="text-muted-foreground px-4 pt-1 text-[10px]">
          {t("cards.createdAt", {
            date: f.dateTime(new Date(order.createdAt), {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Tehran",
              calendar: locale === "fa" ? "persian" : "gregory",
            }),
          })}
        </time>
      )}
      <button
        type="button"
        disabled={!onOpen}
        onClick={onOpen}
        aria-label={t("viewOrder", { number: order.number })}
        className={cn(
          "focus-visible:ring-ring flex w-full flex-col px-4 pt-3 pb-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-inset",
          order.status === "delivered" ? "gap-3" : "gap-4",
        )}
      >
        <OrderCardContent order={order} />
      </button>
      <InventoryException order={order} />
      <div
        className={cn(
          "border-border/40 flex items-end gap-2 border-t px-3 py-2",
          order.status !== "delivered" && "bg-muted/15",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {pendingPayment && onMove && <OrderInvoiceDialog order={order} />}
          {nextStatus && onMove ? (
            <Button
              variant="ghost"
              className={cn(
                "h-auto min-h-9 gap-2 rounded-lg px-2 py-2 text-xs font-medium whitespace-normal",
                actionStyles[order.status],
              )}
              disabled={!canMoveOrder(order, nextStatus)}
              title={!canMoveOrder(order, nextStatus) ? t("customerFlow.blocked") : undefined}
              onClick={() => onMove(nextStatus)}
            >
              {t(`nextActions.${order.status}`)}
              <ArrowLeft className="size-3.5 shrink-0 ltr:rotate-180" />
            </Button>
          ) : (
            <span className="text-muted-foreground py-2 text-[10px]">
              {t(order.status === "delivered" ? "cards.complete" : presentation.label)}
            </span>
          )}
        </div>
        {handle ?? <GripVertical className="text-muted-foreground size-4" />}
      </div>
    </article>
  );
}
