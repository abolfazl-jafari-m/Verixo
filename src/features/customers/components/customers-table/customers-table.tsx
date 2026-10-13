"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { MoreHorizontal, UserRound } from "lucide-react";
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
import type { CustomerOverview } from "../../types";
import { customerDateOptions } from "../../utils";

export function CustomersTable({
  customers,
  onSelect,
}: {
  customers: CustomerOverview[];
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("customers");
  const f = useFormatter();
  const locale = useLocale();
  const [menuId, setMenuId] = useState<string | null>(null);
  if (!customers.length)
    return (
      <p
        role="status"
        className="border-border/50 bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm leading-6"
      >
        {t("noResults")}
      </p>
    );
  return (
    <div className="border-border/50 bg-card min-w-0 overflow-hidden rounded-2xl border">
      <Table className="min-w-[850px] [&_td]:px-4 [&_th]:px-4">
        <TableCaption className="sr-only">{t("title")}</TableCaption>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-border/50 hover:bg-transparent">
            {["name", "phone", "city", "orderCount", "totalSpent", "lastOrder", "actions"].map(
              (key) => (
                <TableHead key={key} scope="col" className="text-muted-foreground h-11 text-xs">
                  {t(key)}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map(({ customer, orders, totalSpent, lastOrderAt }) => (
            <TableRow
              key={customer.id}
              onClick={() => onSelect(customer.id)}
              className="border-border/40 hover:bg-muted/40 focus-within:bg-muted/40 cursor-pointer motion-reduce:transition-none"
            >
              <TableCell className="py-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(customer.id);
                  }}
                  aria-label={t("viewCustomer", { name: customer.name })}
                  className="focus-visible:ring-ring flex max-w-64 items-center gap-3 rounded-lg text-start outline-none focus-visible:ring-2"
                >
                  <span className="bg-muted/60 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                    <UserRound className="size-4" />
                  </span>
                  <span className="truncate font-medium">{customer.name}</span>
                </button>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                <bdi>{customer.phone}</bdi>
              </TableCell>
              <TableCell>{customer.city || t("notAvailable")}</TableCell>
              <TableCell className="tabular-nums">{f.number(orders.length)}</TableCell>
              <TableCell className="font-medium tabular-nums">
                {f.number(totalSpent)}{" "}
                <span className="text-muted-foreground text-xs">{t("currency")}</span>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {lastOrderAt
                  ? f.dateTime(new Date(lastOrderAt), customerDateOptions(locale))
                  : t("noOrdersShort")}
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Popover
                  open={menuId === customer.id}
                  onOpenChange={(open) => setMenuId(open ? customer.id : null)}
                >
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        aria-label={t("actionsFor", { name: customer.name })}
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    dir={locale === "fa" ? "rtl" : "ltr"}
                    className="w-44 p-1.5"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setMenuId(null);
                        onSelect(customer.id);
                      }}
                    >
                      {t("viewDetails")}
                    </Button>
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
