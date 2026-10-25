"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { AppState, ContentSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@/lib/i18n/navigations";
import { useOrdersStore } from "../orders-provider/orders-provider";
import { OrderSelect } from "../order-select/order-select";
import { OrderDateFilter } from "../orders-workspace/order-date-filter";
import { OrderDetails } from "../order-details/order-details";
import { ArchiveAction } from "../archive-action/archive-action";
import { archivedOrders } from "../../archive";
import { orderDateKey, orderTotals } from "../../utils";
import type { Order } from "../../types";
import { statusPresentation } from "../../status-presentation";

export function ArchivedOrders() {
  const t = useTranslations("orderArchive");
  const o = useTranslations("orders");
  const f = useFormatter();
  const orders = useOrdersStore((state) => state.orders);
  const ready = useOrdersStore((state) => state.ready);
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("all");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<string | null>(null);
  const archived = archivedOrders(orders);
  const query = search.trim().toLocaleLowerCase();
  const filtered = archived
    .filter(
      (order) =>
        `${order.number} ${order.customer?.name ?? ""}`.toLocaleLowerCase().includes(query) &&
        (payment === "all" || order.payment === payment) &&
        (!date || orderDateKey(order.createdAt) >= date),
    )
    .sort(
      (a, b) =>
        (sort === "oldest" ? 1 : -1) *
        (a.archivedAt!.localeCompare(b.archivedAt!) || a.id.localeCompare(b.id)),
    );
  const formatDate = (value: string) =>
    f.dateTime(new Date(value), {
      calendar: "persian",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Tehran",
    });
  const columns: ColumnDef<Order>[] = [
    {
      id: "number",
      header: t("number"),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <bdi>{order.number}</bdi>
          </div>
        );
      },
    },
    {
      id: "customer",
      header: t("customer"),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="max-w-60 break-words whitespace-normal">
            {order.customer?.name ?? o("customerFlow.awaiting")}
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: t("createdAt"),
      cell: ({ row }) => {
        const order = row.original;
        return <div>{formatDate(order.createdAt)}</div>;
      },
    },
    {
      id: "total",
      header: t("total"),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            {f.number(orderTotals(order.lines, order.shipping).total)} {o("currency")}
          </div>
        );
      },
    },
    {
      id: "payment",
      header: t("payment"),
      cell: ({ row }) => {
        const order = row.original;
        return <div>{o(`payments.${order.payment}`)}</div>;
      },
    },
    {
      id: "status",
      header: t("status"),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <span
              className={`rounded-md px-2 py-1 text-xs ${statusPresentation[order.status].badge}`}
            >
              {o(`statuses.${order.status}`)}
            </span>
          </div>
        );
      },
    },
    {
      id: "archivedAt",
      header: t("archivedAt"),
      cell: ({ row }) => {
        const order = row.original;
        return <div>{formatDate(order.archivedAt!)}</div>;
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setSelected(order.id)}
                aria-label={t("open", { number: order.number })}
              >
                {o("details")}
              </Button>
              <ArchiveAction ids={[order.id]} restore />
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="min-w-0 space-y-5">
      <Button variant="outline" nativeButton={false} render={<Link href="/orders" />}>
        {t("active")}
      </Button>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="archive-search" className="text-sm font-medium">
            {o("search")}
          </label>
          <Input
            id="archive-search"
            value={search}
            placeholder={o("searchPlaceholder")}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>
        <OrderSelect
          id="archive-payment"
          label={o("payment")}
          value={payment}
          onChange={(value) => {
            setPayment(value);
          }}
          options={[
            { value: "all", label: o("allPayments") },
            { value: "paid", label: o("payments.paid") },
            { value: "pending", label: o("payments.pending") },
          ]}
        />
        <OrderDateFilter
          value={date}
          onChange={(value) => {
            setDate(value);
          }}
        />
        <OrderSelect
          id="archive-sort"
          label={t("sort")}
          value={sort}
          onChange={(value) => {
            setSort(value);
          }}
          options={[
            { value: "newest", label: t("newest") },
            { value: "oldest", label: t("oldest") },
          ]}
        />
      </div>
      {(search || date || payment !== "all") && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setDate("");
            setPayment("all");
          }}
        >
          {o("clear")}
        </Button>
      )}
      {!ready ? (
        <div role="status" aria-label={t("loading")}>
          <ContentSkeleton variant="board" />
        </div>
      ) : !storageAvailable ? (
        <AppState
          kind="error"
          title={o("customerFlow.storageUnavailable")}
          description={t("retryDescription")}
          action={
            <Button onClick={() => window.dispatchEvent(new Event("focus"))}>{t("retry")}</Button>
          }
        />
      ) : !filtered.length ? (
        <AppState
          title={archived.length ? o("noResults") : t("empty")}
          description={archived.length ? undefined : t("emptyDescription")}
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          caption={t("title")}
          getRowId={(order) => order.id}
        />
      )}
      <OrderDetails
        order={orders.find((order) => order.id === selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
