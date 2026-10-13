"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Send } from "lucide-react";
import { NeedActionCard } from "@/features/dashboard/components/need-actions/need-action-card/need-action-card";
import { useTranslations } from "next-intl";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

type ActionRequiredOrder = {
  id: string;
  customer: string;
  issue: string;
  amount: string;
  updatedAt: string;
};

export function NeedActions() {
  const t = useTranslations("dashboard.actions");
  const data: ActionRequiredOrder[] = [
    {
      id: "#۴۵۸۲",
      customer: "سارا محمدی",
      issue: t("invoiceNotSent"),
      amount: `۳٬۴۰۰٬۰۰۰ ${t("currency")}`,
      updatedAt: t("minutesAgo"),
    },
  ];

  const columns: ColumnDef<ActionRequiredOrder>[] = [
    {
      accessorKey: "id",
      header: t("table.order"),
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.id}</span>,
    },
    {
      accessorKey: "customer",
      header: t("table.customer"),
      cell: ({ row }) => <span className="font-medium">{row.original.customer}</span>,
    },
    {
      accessorKey: "issue",
      header: t("table.issue"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.issue}</span>,
    },
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) => <span className="font-semibold tabular-nums">{row.original.amount}</span>,
    },
    {
      accessorKey: "updatedAt",
      header: t("table.updatedAt"),
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">{row.original.updatedAt}</span>
      ),
    },
    {
      id: "action",
      header: () => <span className="block text-left">{t("table.action")}</span>,
      cell: () => (
        <div className="text-left">
          <Button className="h-8 gap-1.5 px-3 text-xs">
            <Send className="size-3" />
            {t("sendInvoice")}
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className={"space-y-4"}>
      <div className={"flex items-center justify-between"}>
        <div className={"flex items-center gap-2"}>
          <h2 className={"font-semibold"}>{t("title")}</h2>
          <Badge variant={"destructive"} className={"h-fit text-[10px]"}>
            {t("itemCount", { count: 6 })}
          </Badge>
        </div>
        <div className={"flex items-center gap-0.5"}>
          <p className={"text-sm"}>{t("all")}</p>
          <ChevronLeft className={"size-3"} />
        </div>
      </div>
      <div className="border-border bg-card hidden overflow-hidden rounded-xl border shadow-sm lg:block">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className={"grid space-y-4 lg:hidden"}>
        <NeedActionCard />
      </ul>
    </div>
  );
}
