"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useOrders } from "../orders-provider/orders-provider";
import { canArchiveOrder } from "../../archive";

export function ArchiveAction({
  ids,
  restore = false,
  onSuccess,
}: {
  ids: string[];
  restore?: boolean;
  onSuccess?: (ids: string[]) => void;
}) {
  const t = useTranslations("orderArchive");
  const locale = useLocale();
  const { orders, ready, archiveOrders } = useOrders();
  const [open, setOpen] = useState(false);
  const busy = useRef(false);
  const selected = [...new Set(ids)];
  const eligible = orders.filter(
    (order) =>
      selected.includes(order.id) && (restore ? !!order.archivedAt : canArchiveOrder(order)),
  );
  const skipped = selected.length - eligible.length;
  const Icon = restore ? ArchiveRestore : Archive;
  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "h-9 gap-2 rounded-xl px-3",
          restore
            ? "bg-primary/8 text-primary hover:bg-primary/15"
            : "bg-muted/60 text-foreground hover:bg-muted",
        )}
        disabled={!ready || !eligible.length}
        onClick={() => setOpen(true)}
      >
        <Icon className="size-4" aria-hidden="true" />
        {t(restore ? "restore" : "archive", { count: eligible.length })}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={locale === "fa" ? "rtl" : "ltr"} className="gap-5 rounded-2xl">
          <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <DialogHeader>
            <DialogTitle>
              {t(restore ? "restore" : "archive", { count: eligible.length })}
            </DialogTitle>
            <DialogDescription>
              {t(restore ? "restoreDescription" : "confirmDescription", { count: eligible.length })}
            </DialogDescription>
          </DialogHeader>
          <ul
            className="bg-muted/30 divide-border/40 max-h-48 divide-y overflow-y-auto rounded-xl px-4 text-sm"
            aria-label={t("eligibleOrders")}
          >
            {eligible.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <bdi className="font-medium tabular-nums">{order.number}</bdi>
                {order.customer && (
                  <span className="text-muted-foreground text-xs">{order.customer.name}</span>
                )}
              </li>
            ))}
          </ul>
          {skipped > 0 && (
            <p role="status" className="text-muted-foreground text-sm">
              {t("skipped", { count: skipped })}
            </p>
          )}
          <div className="border-border/50 flex flex-wrap justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              disabled={!eligible.length}
              onClick={() => {
                if (busy.current) return;
                busy.current = true;
                try {
                  const result = archiveOrders(selected, restore);
                  if (result.changed.length) {
                    toast.add({
                      title: t(restore ? "restored" : "archived", { count: result.changed.length }),
                      type: "success",
                    });
                    onSuccess?.(result.changed);
                  }
                  if (result.failed.length)
                    toast.add({
                      title: t("failed", { count: result.failed.length }),
                      type: "error",
                    });
                  if (result.skipped.length)
                    toast.add({ title: t("skipped", { count: result.skipped.length }) });
                  setOpen(false);
                } finally {
                  busy.current = false;
                }
              }}
            >
              <Icon className="size-4" aria-hidden="true" />
              {t("confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
