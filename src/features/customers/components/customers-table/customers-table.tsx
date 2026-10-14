"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { MoreHorizontal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
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
  const columns: ColumnDef<CustomerOverview>[] = [
    {
      id: "name",
      header: t("name"),
      accessorFn: (r) => r.customer.name,
      cell: ({ row }) => {
        const { customer } = row.original;
        return (
          <div className="py-3">
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
          </div>
        );
      },
    },
    {
      id: "phone",
      header: t("phone"),
      accessorFn: (r) => r.customer.phone,
      cell: ({ row }) => {
        const { customer } = row.original;
        return (
          <div className="text-muted-foreground tabular-nums">
            <bdi>{customer.phone}</bdi>
          </div>
        );
      },
    },
    {
      id: "city",
      header: t("city"),
      accessorFn: (r) => r.customer.city,
      cell: ({ row }) => {
        const { customer } = row.original;
        return <div>{customer.city || t("notAvailable")}</div>;
      },
    },
    {
      id: "orderCount",
      header: t("orderCount"),
      accessorFn: (r) => r.orders.length,
      cell: ({ row }) => {
        const { orders } = row.original;
        return <div className="tabular-nums">{f.number(orders.length)}</div>;
      },
    },
    {
      id: "totalSpent",
      header: t("totalSpent"),
      accessorFn: (r) => r.totalSpent,
      cell: ({ row }) => {
        const { totalSpent } = row.original;
        return (
          <div className="font-medium tabular-nums">
            {f.number(totalSpent)}{" "}
            <span className="text-muted-foreground text-xs">{t("currency")}</span>
          </div>
        );
      },
    },
    {
      id: "lastOrder",
      header: t("lastOrder"),
      accessorFn: (r) => r.lastOrderAt,
      cell: ({ row }) => {
        const { lastOrderAt } = row.original;
        return (
          <div className="text-muted-foreground text-xs">
            {lastOrderAt
              ? f.dateTime(new Date(lastOrderAt), customerDateOptions(locale))
              : t("noOrdersShort")}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      accessorFn: (r) => r.customer.id,
      cell: ({ row }) => {
        const { customer } = row.original;
        return (
          <div onClick={(event) => event.stopPropagation()}>
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
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      data={customers}
      columns={columns}
      caption={t("title")}
      getRowId={(row) => row.customer.id}
      onRowClick={(row) => onSelect(row.customer.id)}
    />
  );
}
