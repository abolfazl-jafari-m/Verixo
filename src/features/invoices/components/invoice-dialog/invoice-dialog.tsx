"use client";
import { ActionFeedback } from "@/components/shared";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LockKeyhole, Pencil, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders } from "@/features/orders/components/orders-provider/orders-provider";
import { invoiceFromOrder } from "../../utils";
import { InvoiceDocument } from "../invoice-document/invoice-document";
import { InvoiceEditor } from "../invoice-editor/invoice-editor";
import { InvoiceShare } from "../invoice-share/invoice-share";

export function InvoiceDialog({
  orderId,
  onClose,
  initialEditing = false,
}: {
  orderId: string;
  onClose: () => void;
  initialEditing?: boolean;
}) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const { orders, sendInvoice, storageAvailable } = useOrders();
  const [editing, setEditing] = useState(initialEditing);
  const [feedback, setFeedback] = useState<"saved" | "sentSuccess" | "sendFailed" | null>(null);
  const order = orders.find((item) => item.id === orderId);
  const invoice = order ? invoiceFromOrder(order) : null;
  const locked = invoice?.payment === "paid" || order?.status === "cancelled";
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="flex max-h-[92dvh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <div className="border-border/50 flex shrink-0 justify-between gap-3 border-b p-5">
          <DialogHeader>
            <DialogTitle>
              {t(editing && !locked ? "edit" : "preview")} · <bdi>{invoice?.number}</bdi>
            </DialogTitle>
            <DialogDescription className="text-xs leading-6">{t("demo")}</DialogDescription>
          </DialogHeader>
          <Button
            aria-label={t("close")}
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5">
          {!invoice ? (
            <p role="alert">{t("unavailable")}</p>
          ) : (
            <>
              {locked && (
                <p className="bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-xl p-3 text-xs leading-6">
                  <LockKeyhole className="mt-1 size-4 shrink-0" />
                  {t(order?.status === "cancelled" ? "cancelledLocked" : "locked")}
                </p>
              )}
              {editing && !locked ? (
                <InvoiceEditor
                  key={invoice.id}
                  invoice={invoice}
                  onCancel={() => setEditing(false)}
                  onDone={() => {
                    setEditing(false);
                    setFeedback("saved");
                  }}
                />
              ) : (
                <>
                  <InvoiceDocument invoice={invoice} />
                  <InvoiceShare token={invoice.publicToken} />
                  {!locked && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(true);
                          setFeedback(null);
                        }}
                      >
                        <Pencil className="size-4" />
                        {t("edit")}
                      </Button>
                      <Button
                        disabled={order?.invoiceStatus === "sent"}
                        onClick={() =>
                          setFeedback(sendInvoice(orderId) ? "sentSuccess" : "sendFailed")
                        }
                      >
                        <Send className="size-4" />
                        {t(order?.invoiceStatus === "sent" ? "alreadySent" : "send")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {feedback && (
            <ActionFeedback
              kind={feedback === "sendFailed" ? "error" : "success"}
              message={t(feedback)}
            />
          )}
          {!storageAvailable && (
            <p role="alert" className="text-destructive text-xs">
              {t("storageUnavailable")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
