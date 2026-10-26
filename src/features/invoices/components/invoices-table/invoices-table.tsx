"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { orderTotals } from "@/features/orders/utils";
import type { Invoice } from "../../types";
import { invoiceDateOptions, invoiceStatusStyles } from "../../utils";
import { InvoiceShare } from "../invoice-share/invoice-share";

export function InvoicesTable({
  invoices,
  ascending,
  onSort,
  onOpen,
}: {
  invoices: Invoice[];
  ascending: boolean;
  onSort: () => void;
  onOpen: (orderId: string, editing: boolean) => void;
}) {
  const t = useTranslations("invoices");
  const f = useFormatter();
  const locale = useLocale();
  const [menuId, setMenuId] = useState<string | null>(null);
  const columns: ColumnDef<Invoice>[] = [
    {
      id: "number",
      header: t("number"),
      accessorFn: (r) => r.number,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="py-4">
            <button
              type="button"
              aria-label={t("viewInvoice", { number: invoice.number })}
              onClick={(event) => {
                event.stopPropagation();
                onOpen(invoice.orderId, false);
              }}
              className="focus-visible:ring-ring rounded font-medium outline-none focus-visible:ring-2"
            >
              <bdi>{invoice.number}</bdi>
            </button>
          </div>
        );
      },
    },
    {
      id: "order",
      header: t("order"),
      accessorFn: (r) => r.orderNumber,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="text-muted-foreground text-xs">
            <bdi>{invoice.orderNumber}</bdi>
          </div>
        );
      },
    },
    {
      id: "customer",
      header: t("customer"),
      accessorFn: (r) => r.customer?.name,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div>
            <p className="max-w-52 truncate text-sm">
              {invoice.customer?.name ?? t("customerPending")}
            </p>
            {invoice.customer && (
              <p className="text-muted-foreground mt-1 text-xs">
                <bdi>{invoice.customer.phone}</bdi>
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "date",
      header: () => (
        <Button variant="ghost" className="h-8 px-0 text-xs" onClick={onSort}>
          {t("date")}
          {ascending ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
        </Button>
      ),
      accessorFn: (r) => r.createdAt,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="text-muted-foreground text-xs">
            {f.dateTime(new Date(invoice.createdAt), invoiceDateOptions(locale))}
          </div>
        );
      },
    },
    {
      id: "total",
      header: t("total"),
      accessorFn: (r) => orderTotals(r.lines, r.shipping, r.discountPercentage).total,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="font-medium tabular-nums">
            {f.number(
              orderTotals(invoice.lines, invoice.shipping, invoice.discountPercentage).total,
            )}{" "}
            <span className="text-muted-foreground text-xs">{t("currency")}</span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: t("status"),
      accessorFn: (r) => r.status,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div>
            <Badge variant="ghost" className={invoiceStatusStyles[invoice.status]}>
              {t(`statuses.${invoice.status}`)}
            </Badge>
            <p className="text-muted-foreground mt-1 text-[10px]">
              {t(`payments.${invoice.payment}`)}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      accessorFn: (r) => r.id,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div onClick={(event) => event.stopPropagation()}>
            <Popover
              open={menuId === invoice.id}
              onOpenChange={(open) => setMenuId(open ? invoice.id : null)}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("actionsFor", { number: invoice.number })}
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                dir={locale === "fa" ? "rtl" : "ltr"}
                className="w-72 max-w-[calc(100vw-2rem)] gap-2 p-3"
              >
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setMenuId(null);
                    onOpen(invoice.orderId, false);
                  }}
                >
                  {t("view")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  disabled={invoice.payment === "paid"}
                  onClick={() => {
                    setMenuId(null);
                    onOpen(invoice.orderId, true);
                  }}
                >
                  {t("edit")}
                </Button>
                <InvoiceShare invoice={invoice} />
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      data={invoices}
      columns={columns}
      caption={t("title")}
      getRowId={(row) => row.id}
      onRowClick={(row) => onOpen(row.orderId, false)}
    />
  );
}
