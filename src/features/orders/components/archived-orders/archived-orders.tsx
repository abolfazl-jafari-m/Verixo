"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { AppState, ContentSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigations";
import { useOrders } from "../orders-provider/orders-provider";
import { OrderSelect } from "../order-select/order-select";
import { OrderDateFilter } from "../orders-workspace/order-date-filter";
import { OrderDetails } from "../order-details/order-details";
import { ArchiveAction } from "../archive-action/archive-action";
import { archivedOrders } from "../../archive";
import { orderDateKey, orderTotals } from "../../utils";
import { statusPresentation } from "../../status-presentation";

export function ArchivedOrders() {
  const t = useTranslations("orderArchive");
  const o = useTranslations("orders");
  const f = useFormatter();
  const { orders, ready, storageAvailable } = useOrders();
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("all");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
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
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages - 1);
  const formatDate = (value: string) =>
    f.dateTime(new Date(value), {
      calendar: "persian",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Tehran",
    });
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
              setPage(0);
            }}
          />
        </div>
        <OrderSelect
          id="archive-payment"
          label={o("payment")}
          value={payment}
          onChange={(value) => {
            setPayment(value);
            setPage(0);
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
            setPage(0);
          }}
        />
        <OrderSelect
          id="archive-sort"
          label={t("sort")}
          value={sort}
          onChange={(value) => {
            setSort(value);
            setPage(0);
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
            setPage(0);
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
        <>
          <div className="border-border/50 bg-card min-w-0 overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "number",
                    "customer",
                    "createdAt",
                    "total",
                    "payment",
                    "status",
                    "archivedAt",
                    "actions",
                  ].map((key) => (
                    <TableHead key={key}>{t(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(current * 10, current * 10 + 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <bdi>{order.number}</bdi>
                    </TableCell>
                    <TableCell className="max-w-60 break-words whitespace-normal">
                      {order.customer?.name ?? o("customerFlow.awaiting")}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {f.number(orderTotals(order.lines, order.shipping).total)} {o("currency")}
                    </TableCell>
                    <TableCell>{o(`payments.${order.payment}`)}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${statusPresentation[order.status].badge}`}
                      >
                        {o(`statuses.${order.status}`)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(order.archivedAt!)}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <nav
            aria-label={t("pagination")}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <Button variant="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>
              {t("previous")}
            </Button>
            <p className="text-sm">
              {t("page", { page: current + 1, pages, count: filtered.length })}
            </p>
            <Button
              variant="outline"
              disabled={current + 1 >= pages}
              onClick={() => setPage(current + 1)}
            >
              {t("next")}
            </Button>
          </nav>
        </>
      )}
      <OrderDetails
        order={orders.find((order) => order.id === selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
