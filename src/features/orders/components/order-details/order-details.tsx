"use client";

import { statusPresentation } from "../../status-presentation";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type Order } from "../../types";
import { orderTotals } from "../../utils";
import { CustomerFormLink } from "../customer-form-link/customer-form-link";
import { OrderProgress } from "../order-progress/order-progress";

export function OrderDetails({
  order,
  onClose,
  onPrintLabel,
}: {
  order: Order | undefined;
  onClose: () => void;
  onPrintLabel?: (id: string) => void;
}) {
  const t = useTranslations("orders");
  const shipping = useTranslations("shippingLabels");
  const f = useFormatter();
  const locale = useLocale();
  const totals = order ? orderTotals(order.lines, order.shipping) : undefined;
  return (
    <Dialog
      open={!!order}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {order && totals && (
          <>
            <div className="border-border/50 flex shrink-0 items-start justify-between gap-3 border-b px-5 py-5 sm:px-6">
              <DialogHeader className="gap-2">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <ReceiptText className="size-4" />
                  {t("details")}
                </div>
                <DialogTitle className="text-xl font-bold">
                  <bdi>#{order.number}</bdi>
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="size-3.5" />
                  {f.dateTime(new Date(order.createdAt), {
                    calendar: "persian",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Tehran",
                  })}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted/40 size-9 rounded-full"
                aria-label={t("close")}
                onClick={onClose}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-5 py-5 sm:px-6">
              <OrderProgress status={order.status} />
              <section className="bg-muted/25 space-y-3 rounded-2xl p-4">
                <p className="text-sm font-medium">
                  {t(`customerFlow.${order.customerInformationStatus}`)}
                </p>
                {order.shippingMethod && (
                  <p className="text-sm">
                    {t("customerFlow.shippingMethod")}:{" "}
                    {t(`customerFlow.methods.${order.shippingMethod}.label`)}
                  </p>
                )}
                <CustomerFormLink order={order} />
              </section>
              <div className="grid gap-4 sm:grid-cols-2">
                <section className="bg-muted/25 flex flex-col gap-3 rounded-2xl p-4">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
                    <UserRound className="size-4" />
                    {t("customer")}
                  </h3>
                  <p className="font-semibold break-words">
                    {order.customer?.name ?? t("customerFlow.awaiting")}
                  </p>
                  {order.customer && (
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-primary focus-visible:ring-ring flex w-fit items-center gap-2 rounded-md text-sm outline-none focus-visible:ring-2"
                    >
                      <Phone className="size-3.5" />
                      <bdi>{order.customer.phone}</bdi>
                    </a>
                  )}
                </section>
                <section className="bg-muted/25 flex flex-col gap-3 rounded-2xl p-4">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
                    <MapPin className="size-4" />
                    {t("address")}
                  </h3>
                  <p className="text-sm leading-7 break-words">
                    {order.customer?.address ?? t("customerFlow.pending")}
                  </p>
                  {order.customer && (
                    <p className="text-muted-foreground text-sm">
                      {order.customer.province} · {order.customer.city} ·{" "}
                      <bdi>{order.customer.postalCode}</bdi>
                    </p>
                  )}
                  {order.customer?.deliveryNotes && (
                    <p className="text-sm break-words">{order.customer.deliveryNotes}</p>
                  )}
                </section>
              </div>
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Package className="text-primary size-4" />
                    {t("products")}
                  </h3>
                  <span className="text-muted-foreground text-xs">
                    {t("itemCount", { count: totals.count })}
                  </span>
                </div>
                <ul className="divide-border/40 border-border/50 divide-y rounded-2xl border px-4">
                  {order.lines.map((line, index) => (
                    <li
                      key={`${line.productId}-${index}`}
                      className="flex flex-wrap items-center gap-3 py-4"
                    >
                      <span className="bg-muted/40 text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <Package className="size-5" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="text-sm font-medium break-words">{line.name}</p>
                        {line.variantLabel && (
                          <p className="text-muted-foreground text-xs">{line.variantLabel}</p>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {f.number(line.quantity)} × {f.number(line.unitPrice)} {t("currency")}
                        </p>
                      </div>
                      <span className="ms-auto text-sm font-semibold tabular-nums">
                        {f.number(line.quantity * line.unitPrice)}{" "}
                        <span className="text-muted-foreground text-[10px] font-normal">
                          {t("currency")}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {order.notes && (
                    <section className="flex gap-3 rounded-2xl bg-amber-500/8 p-4">
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                      <div className="flex min-w-0 flex-col gap-2">
                        <h3 className="text-xs font-semibold">{t("hasNote")}</h3>
                        <p className="text-muted-foreground text-sm leading-6 break-words whitespace-pre-wrap">
                          {order.notes}
                        </p>
                      </div>
                    </section>
                  )}
                </div>
                <dl className="bg-muted/25 flex flex-col gap-3 rounded-2xl p-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t("subtotal")}</dt>
                    <dd>
                      {f.number(totals.subtotal)} {t("currency")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t("shipping")}</dt>
                    <dd>
                      {f.number(order.shipping)} {t("currency")}
                    </dd>
                  </div>
                  <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <dt className="font-semibold">{t("total")}</dt>
                    <dd className="text-primary text-lg font-bold">
                      {f.number(totals.total)}{" "}
                      <span className="text-xs font-normal">{t("currency")}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">{t("payment")}</dt>
                    <dd
                      className={cn(
                        "inline-flex rounded-md px-2 py-1 text-xs",
                        statusPresentation[
                          order.payment === "paid" ? "delivered" : "pending_payment"
                        ].badge,
                      )}
                    >
                      {t(`payments.${order.payment}`)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="border-border/50 bg-muted/15 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
              {onPrintLabel && (
                <Button variant="outline" onClick={() => onPrintLabel(order.id)}>
                  {shipping("individualPrint")}
                </Button>
              )}
              <p className="text-muted-foreground max-w-lg text-[11px] leading-5">{t("demo")}</p>
              <Button variant="secondary" className="h-10 px-6" onClick={onClose}>
                {t("close")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
