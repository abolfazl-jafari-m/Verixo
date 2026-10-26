"use client";

import { AppState, ContentSkeleton } from "@/components/shared";
import { Link } from "@/lib/i18n/navigations";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { normalizePhone } from "@/features/orders/utils";
import { invoiceStatuses } from "../../types";
import { invoiceFromOrder } from "../../utils";
import { InvoicesTable } from "../invoices-table/invoices-table";
import { InvoiceDialog } from "../invoice-dialog/invoice-dialog";

export function InvoicesWorkspace() {
  const t = useTranslations("invoices");
  const states = useTranslations("appStates");
  const locale = useLocale();
  const orders = useOrdersStore((state) => state.orders);
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  const ready = useOrdersStore((state) => state.ready);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [ascending, setAscending] = useState(false);
  const [selected, setSelected] = useState<{ orderId: string; editing: boolean } | null>(null);
  const query = normalizePhone(search).toLocaleLowerCase();
  const invoices = orders
    .map(invoiceFromOrder)
    .filter(
      (invoice) =>
        (status === "all" || invoice.status === status) &&
        (!query ||
          normalizePhone(
            `${invoice.number} ${invoice.orderNumber} ${invoice.customer?.name ?? ""} ${invoice.customer?.phone ?? ""}`,
          )
            .toLocaleLowerCase()
            .includes(query)),
    )
    .sort(
      (a, b) =>
        (ascending ? 1 : -1) *
        (a.createdAt.localeCompare(b.createdAt) || a.number.localeCompare(b.number)),
    );
  const options = [
    { value: "all", label: t("all") },
    ...invoiceStatuses.map((value) => ({ value, label: t(`statuses.${value}`) })),
  ];
  return (
    <div className="min-w-0 space-y-4">
      <p className="text-muted-foreground text-xs leading-6">{t("demo")}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="invoice-search" className="text-sm font-medium">
            {t("search")}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-3 size-4" />
            <Input
              id="invoice-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchHint")}
              className="h-10 rounded-xl ps-9"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <label htmlFor="invoice-status" className="text-sm font-medium">
            {t("status")}
          </label>
          <Select
            items={options}
            value={status}
            onValueChange={(value) => {
              if (value !== null) setStatus(value);
            }}
          >
            <SelectTrigger id="invoice-status" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} dir={locale === "fa" ? "rtl" : "ltr"}>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(search || status !== "all") && (
          <Button
            variant="ghost"
            className="h-10"
            onClick={() => {
              setSearch("");
              setStatus("all");
            }}
          >
            {t("clear")}
          </Button>
        )}
      </div>
      <p role="status" className="text-muted-foreground text-xs">
        {ready ? t("count", { count: invoices.length }) : null}
      </p>
      {ready && !storageAvailable && (
        <AppState
          kind="error"
          title={states("readError")}
          description={states("readErrorHint")}
          action={
            <Button variant="outline" onClick={() => window.dispatchEvent(new Event("focus"))}>
              {states("retry")}
            </Button>
          }
        />
      )}
      {!ready ? (
        <ContentSkeleton columns={7} />
      ) : invoices.length === 0 && !storageAvailable ? null : invoices.length === 0 ? (
        <AppState
          icon={FileText}
          title={orders.length ? states("noResults") : t("emptyTitle")}
          description={orders.length ? states("noResultsDescription") : t("emptyHint")}
          action={
            orders.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
              >
                {states("clear")}
              </Button>
            ) : (
              <Link href="/orders/create" className={buttonVariants()}>
                {states("newOrder")}
              </Link>
            )
          }
        />
      ) : (
        <InvoicesTable
          invoices={invoices}
          ascending={ascending}
          onSort={() => setAscending(!ascending)}
          onOpen={(orderId, editing) => setSelected({ orderId, editing })}
        />
      )}
      {selected && (
        <InvoiceDialog
          key={selected.orderId}
          orderId={selected.orderId}
          initialEditing={selected.editing}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
