"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  if (!invoices.length)
    return (
      <p
        role="status"
        className="border-border/50 text-muted-foreground rounded-2xl border p-8 text-center text-sm"
      >
        {t("noResults")}
      </p>
    );
  return (
    <div className="border-border/50 bg-card min-w-0 overflow-hidden rounded-2xl border">
      <Table className="min-w-[900px] [&_td]:px-4 [&_th]:px-4">
        <TableCaption className="sr-only">{t("title")}</TableCaption>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-border/50 hover:bg-transparent">
            {["number", "order", "customer"].map((key) => (
              <TableHead key={key} scope="col" className="text-muted-foreground text-xs">
                {t(key)}
              </TableHead>
            ))}
            <TableHead scope="col" aria-sort={ascending ? "ascending" : "descending"}>
              <Button variant="ghost" className="h-10 px-0 text-xs" onClick={onSort}>
                {t("date")}
                {ascending ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              </Button>
            </TableHead>
            {["total", "status", "actions"].map((key) => (
              <TableHead key={key} scope="col" className="text-muted-foreground text-xs">
                {t(key)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              onClick={() => onOpen(invoice.orderId, false)}
              className="border-border/40 hover:bg-muted/40 focus-within:bg-muted/40 cursor-pointer"
            >
              <TableCell className="py-4">
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
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                <bdi>{invoice.orderNumber}</bdi>
              </TableCell>
              <TableCell>
                <p className="max-w-52 truncate text-sm">
                  {invoice.customer?.name ?? t("customerPending")}
                </p>
                {invoice.customer && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    <bdi>{invoice.customer.phone}</bdi>
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {f.dateTime(new Date(invoice.createdAt), invoiceDateOptions(locale))}
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {f.number(orderTotals(invoice.lines, invoice.shipping).total)}{" "}
                <span className="text-muted-foreground text-xs">{t("currency")}</span>
              </TableCell>
              <TableCell>
                <Badge variant="ghost" className={invoiceStatusStyles[invoice.status]}>
                  {t(`statuses.${invoice.status}`)}
                </Badge>
                <p className="text-muted-foreground mt-1 text-[10px]">
                  {t(`payments.${invoice.payment}`)}
                </p>
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
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
                    <InvoiceShare token={invoice.publicToken} />
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
