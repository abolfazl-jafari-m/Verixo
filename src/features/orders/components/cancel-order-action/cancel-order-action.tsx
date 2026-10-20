"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CircleX, LoaderCircle, X } from "lucide-react";
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
import {
  canCancelOrder,
  cancellationReasons,
  cancellationSchema,
  CancellationError,
} from "../../cancellation";
import type { Order } from "../../types";
import { OrderSelect } from "../order-select/order-select";
import { useOrders } from "../orders-provider/orders-provider";

export function CancelOrderAction({
  order,
  placement = "button",
}: {
  order: Order;
  placement?: "button" | "menu";
}) {
  const t = useTranslations("orders.cancellation");
  const ordersText = useTranslations("orders");
  const locale = useLocale();
  const id = useId();
  const { cancelOrder, ready } = useOrders();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  if (!canCancelOrder(order)) return null;
  return (
    <>
      <Button
        variant={placement === "menu" ? "ghost" : "destructive"}
        className={cn(
          "text-destructive hover:bg-destructive/8 hover:text-destructive h-10 gap-2 rounded-xl px-3 text-sm transition-colors duration-200 motion-reduce:transition-none",
          placement === "menu" &&
            "border-border/40 mt-2 h-12 w-full justify-start gap-3 rounded-t-none border-t text-xs",
        )}
        disabled={!ready}
        onClick={() => setOpen(true)}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            placement === "menu" && "bg-destructive/8 size-8 rounded-xl",
          )}
        >
          <CircleX className="size-4" aria-hidden="true" />
        </span>
        {t("action")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy.current) setOpen(value);
        }}
      >
        <DialogContent
          dir={locale === "fa" ? "rtl" : "ltr"}
          showCloseButton={false}
          className="max-h-[90dvh] gap-0 overflow-y-auto rounded-3xl p-0 shadow-2xl duration-200 motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none sm:max-w-md"
        >
          <div className="border-border/40 bg-muted/20 space-y-4 border-b p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="bg-destructive/8 text-destructive ring-destructive/10 flex size-12 items-center justify-center rounded-2xl ring-1">
                <CircleX className="size-6" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                aria-label={ordersText("close")}
                className="text-muted-foreground hover:bg-muted size-9 rounded-full transition-colors motion-reduce:transition-none"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <DialogHeader className="gap-2.5">
              <DialogTitle className="text-lg leading-7 font-semibold tracking-tight">
                {t("title", { number: order.number })}
              </DialogTitle>
              <DialogDescription className="text-xs leading-6">
                {t("description")}
              </DialogDescription>
            </DialogHeader>
          </div>
          <form
            className="space-y-5 p-5 sm:p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy.current) return;
              const parsed = cancellationSchema.safeParse({ code, note });
              if (!parsed.success) {
                setError(t("errors.reason"));
                return;
              }
              busy.current = true;
              setPending(true);
              setError("");
              try {
                // Let the pending state render before synchronous browser storage work.
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                cancelOrder(order.id, parsed.data);
                toast.add({ title: t("success"), type: "success" });
                setOpen(false);
              } catch (cause) {
                setError(
                  t(`errors.${cause instanceof CancellationError ? cause.code : "storage"}`),
                );
              } finally {
                busy.current = false;
                setPending(false);
              }
            }}
          >
            <OrderSelect
              id={`${id}-reason`}
              label={t("reason")}
              value={code}
              onChange={setCode}
              options={[
                { value: "", label: t("choose") },
                ...cancellationReasons.map((value) => ({ value, label: t(`reasons.${value}`) })),
              ]}
              invalid={!!error}
              describedBy={error ? `${id}-error` : undefined}
            />
            <div className="space-y-2">
              <label htmlFor={`${id}-note`} className="text-sm font-medium">
                {t(code === "other" ? "custom" : "note")}
              </label>
              <textarea
                rows={3}
                className="bg-muted/25 border-border/40 hover:border-border focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-ring/15 min-h-28 w-full resize-y rounded-xl border p-3 text-sm leading-6 transition-colors duration-200 outline-none focus-visible:ring-3 disabled:opacity-50 motion-reduce:transition-none"
                id={`${id}-note`}
                value={note}
                maxLength={500}
                required={code === "other"}
                aria-invalid={!!error && code === "other"}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(event) => setNote(event.target.value)}
                disabled={pending}
              />
            </div>
            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="bg-destructive/8 text-destructive rounded-xl px-3 py-2.5 text-xs leading-6"
              >
                {error}
              </p>
            )}
            <div className="border-border/40 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="bg-muted/40 hover:bg-muted/70 h-11 rounded-xl px-5 transition-colors motion-reduce:transition-none"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                {t("dismiss")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="h-11 gap-2 rounded-xl px-5 font-semibold transition-colors duration-200 motion-reduce:transition-none"
                disabled={pending}
                aria-busy={pending}
              >
                {pending ? (
                  <LoaderCircle
                    className="size-4 animate-spin motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleX className="size-4" aria-hidden="true" />
                )}
                {t(pending ? "pending" : "confirm")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
