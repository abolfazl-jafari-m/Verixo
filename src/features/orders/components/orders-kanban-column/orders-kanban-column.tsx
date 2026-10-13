"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowDownToLine, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusPresentation } from "../../status-presentation";
import { type OrderStatus } from "../../types";
import styles from "../orders-board/orders-scrollbar.module.css";

export function OrdersKanbanColumn({
  status,
  count,
  children,
  dragging,
}: {
  status: OrderStatus;
  count: number;
  children: ReactNode;
  dragging: boolean;
}) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const Icon = statusPresentation[status].icon;
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      aria-label={t(statusPresentation[status].label)}
      style={{ flex: "0 0 18rem" }}
      className={cn(
        "border-border/40 bg-muted/20 relative flex h-[min(740px,75dvh)] min-h-84 flex-col overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
        isOver && "border-primary/60 ring-primary/20 ring-2",
      )}
    >
      <header
        className={cn(
          "border-border/30 flex shrink-0 flex-col gap-3 border-b px-4 py-4",
          statusPresentation[status].badge,
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 shrink-0" />
          <h2 className="min-w-0 flex-1 text-sm font-semibold text-nowrap">
            {t(statusPresentation[status].label)}
          </h2>
          <span className="bg-background/60 flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums">
            {f.number(count)}
          </span>
        </div>
        <p className="text-muted-foreground truncate text-[10px]">{t(`stageHints.${status}`)}</p>
      </header>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 pb-12",
          styles.scrollbar,
          styles.vertical,
        )}
      >
        {count ? (
          children
        ) : (
          <div className="my-auto flex min-h-44 flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="border-border bg-background/40 text-muted-foreground/60 flex size-12 items-center justify-center rounded-2xl border border-dashed">
              <Package className="size-5" />
            </span>
            <p className="text-muted-foreground text-xs font-medium">{t("emptyColumn")}</p>
            <p className="text-muted-foreground/70 text-[11px]">{t("dropHere")}</p>
          </div>
        )}
      </div>
      {dragging && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs shadow-sm",
            isOver
              ? "border-primary/50 bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          <ArrowDownToLine className="size-4" />
          {t("dropHere")}
        </div>
      )}
    </section>
  );
}
