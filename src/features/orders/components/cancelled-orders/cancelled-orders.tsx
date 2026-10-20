"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ArrowUpRight, CircleX, ShieldCheck } from "lucide-react";
import { AppState, ContentSkeleton, DataTable } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigations";
import { cn } from "@/lib/utils";
import { cancellationReasons } from "../../cancellation";
import type { Order } from "../../types";
import { orderTotals } from "../../utils";
import { useOrders } from "../orders-provider/orders-provider";
import { OrderSelect } from "../order-select/order-select";
import { OrderDetails } from "../order-details/order-details";

export function CancelledOrders() {
  const t = useTranslations("cancelledOrders");
  const o = useTranslations("orders");
  const f = useFormatter();
  const locale = useLocale();
  const { orders, ready, storageAvailable } = useOrders();
  const [payment, setPayment] = useState("all");
  const [reason, setReason] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const cancelled = orders.filter((order) => order.status === "cancelled");
  const filtered = cancelled
    .filter(
      (order) =>
        (payment === "all" || order.payment === payment) &&
        (reason === "all" || order.cancellationReason?.code === reason),
    )
    .sort(
      (a, b) =>
        (b.cancelledAt ?? "").localeCompare(a.cancelledAt ?? "") || a.id.localeCompare(b.id),
    );
  const reasonLabel = (order: Order) =>
    order.cancellationReason
      ? o(`cancellation.reasons.${order.cancellationReason.code}`)
      : t("notRecorded");
  const dateLabel = (order: Order) =>
    order.cancelledAt
      ? f.dateTime(new Date(order.cancelledAt), {
          calendar: locale === "fa" ? "persian" : "gregory",
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "Asia/Tehran",
        })
      : t("notRecorded");
  const paymentBadge = (order: Order) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium",
        order.payment === "paid"
          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "bg-muted text-muted-foreground",
      )}
    >
      {o(`payments.${order.payment}`)}
    </span>
  );
  const detailsButton = (order: Order) => (
    <Button
      variant="ghost"
      className="text-primary h-10 gap-2 rounded-xl"
      onClick={() => setSelected(order.id)}
      aria-label={o("viewOrder", { number: order.number })}
    >
      {o("details")}
      <ArrowUpRight className="size-4 rtl:-rotate-90" aria-hidden="true" />
    </Button>
  );
  const columns: ColumnDef<Order>[] = [
    {
      id: "order",
      accessorFn: (order) => order.number,
      header: t("order"),
      cell: ({ row: { original: order } }) => (
        <div className="space-y-1 py-1">
          <bdi className="font-medium tabular-nums">{order.number}</bdi>
          <p className="text-muted-foreground max-w-56 truncate text-xs">
            {order.customer?.name ?? o("customerFlow.awaiting")}
          </p>
        </div>
      ),
    },
    {
      id: "reason",
      header: o("cancellation.reason"),
      cell: ({ row: { original: order } }) => (
        <div className="max-w-64 space-y-1 whitespace-normal">
          <p className="text-sm">{reasonLabel(order)}</p>
          {order.cancellationReason?.note && (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-5 break-words">
              {order.cancellationReason.note}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "cancelledAt",
      header: t("cancelledAt"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{dateLabel(row.original)}</span>
      ),
    },
    { id: "payment", header: o("payment"), cell: ({ row }) => paymentBadge(row.original) },
    {
      id: "total",
      header: o("total"),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {f.number(orderTotals(row.original.lines, row.original.shipping).total)}{" "}
          <span className="text-muted-foreground text-xs">{o("currency")}</span>
        </span>
      ),
    },
    { id: "actions", header: o("details"), cell: ({ row }) => detailsButton(row.original) },
  ];
  return (
    <div className="min-w-0 space-y-5">
      <Button
        variant="ghost"
        className="h-10 gap-2 rounded-xl"
        nativeButton={false}
        render={<Link href="/orders" />}
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t("back")}
      </Button>
      <div className="border-border/40 bg-card flex flex-wrap items-center gap-4 rounded-2xl border p-5">
        <span className="bg-destructive/8 text-destructive flex size-12 shrink-0 items-center justify-center rounded-2xl">
          <CircleX className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{t("total")}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {ready ? f.number(cancelled.length) : "—"}
          </p>
        </div>
        <p className="text-muted-foreground flex max-w-lg items-start gap-2 text-xs leading-6">
          <ShieldCheck className="mt-1 size-4 shrink-0" aria-hidden="true" />
          {t("historyHint")}
        </p>
      </div>
      {!ready ? (
        <ContentSkeleton variant="board" />
      ) : !storageAvailable ? (
        <AppState
          kind="error"
          title={o("customerFlow.storageUnavailable")}
          action={
            <Button onClick={() => window.dispatchEvent(new Event("focus"))}>{t("retry")}</Button>
          }
        />
      ) : !cancelled.length ? (
        <AppState title={t("empty")} description={t("emptyDescription")} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <OrderSelect
              id="cancelled-payment"
              label={o("payment")}
              value={payment}
              onChange={setPayment}
              options={[
                { value: "all", label: o("allPayments") },
                ...(["paid", "pending"] as const).map((value) => ({
                  value,
                  label: o(`payments.${value}`),
                })),
              ]}
            />
            <OrderSelect
              id="cancelled-reason"
              label={o("cancellation.reason")}
              value={reason}
              onChange={setReason}
              options={[
                { value: "all", label: t("allReasons") },
                ...cancellationReasons.map((value) => ({
                  value,
                  label: o(`cancellation.reasons.${value}`),
                })),
              ]}
            />
            {(payment !== "all" || reason !== "all") && (
              <Button
                variant="ghost"
                className="h-10"
                onClick={() => {
                  setPayment("all");
                  setReason("all");
                }}
              >
                {o("clear")}
              </Button>
            )}
          </div>
          <DataTable
            data={filtered}
            columns={columns}
            caption={t("title")}
            getRowId={(order) => order.id}
            search={{
              getValue: (order) =>
                `${order.number} ${order.customer?.name ?? ""} ${order.customer?.phone ?? ""} ${reasonLabel(order)} ${order.cancellationReason?.note ?? ""}`,
              placeholder: t("searchPlaceholder"),
            }}
            renderMobile={(order) => (
              <article className="border-border/40 bg-card flex h-full min-w-0 flex-col gap-4 rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <bdi className="text-sm font-semibold">{order.number}</bdi>
                    <p className="text-muted-foreground mt-1 text-xs break-words">
                      {order.customer?.name ?? o("customerFlow.awaiting")}
                    </p>
                  </div>
                  {paymentBadge(order)}
                </div>
                <div className="bg-muted/35 min-w-0 flex-1 space-y-1.5 rounded-xl p-3">
                  <p className="text-muted-foreground text-[11px]">{o("cancellation.reason")}</p>
                  <p className="text-sm font-medium">{reasonLabel(order)}</p>
                  {order.cancellationReason?.note && (
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-6 break-words">
                      {order.cancellationReason.note}
                    </p>
                  )}
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-muted-foreground">{t("cancelledAt")}</dt>
                    <dd>{dateLabel(order)}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-muted-foreground">{o("total")}</dt>
                    <dd className="font-medium tabular-nums">
                      {f.number(orderTotals(order.lines, order.shipping).total)} {o("currency")}
                    </dd>
                  </div>
                </dl>
                <div className="border-border/40 flex justify-end border-t pt-2">
                  {detailsButton(order)}
                </div>
              </article>
            )}
          />
        </>
      )}
      <OrderDetails
        order={cancelled.find((order) => order.id === selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
