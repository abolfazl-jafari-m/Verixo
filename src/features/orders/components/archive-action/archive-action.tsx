"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  return (
    <>
      <Button variant="outline" disabled={!ready || !eligible.length} onClick={() => setOpen(true)}>
        {t(restore ? "restore" : "archive", { count: eligible.length })}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={locale === "fa" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {t(restore ? "restore" : "archive", { count: eligible.length })}
            </DialogTitle>
            <DialogDescription>
              {t(restore ? "restoreDescription" : "confirmDescription", { count: eligible.length })}
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-40 overflow-y-auto text-sm" aria-label={t("eligibleOrders")}>
            {eligible.map((order) => (
              <li key={order.id}>
                <bdi>{order.number}</bdi>
              </li>
            ))}
          </ul>
          {skipped > 0 && (
            <p role="status" className="text-sm">
              {t("skipped", { count: skipped })}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
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
              {t("confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
