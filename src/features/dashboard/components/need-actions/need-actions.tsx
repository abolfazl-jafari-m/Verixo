"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared";
import { toast } from "@/components/ui/toast";
import { ChevronLeft } from "lucide-react";
import {
  NeedActionCard,
  type ActionRequiredOrder,
} from "@/features/dashboard/components/need-actions/need-action-card/need-action-card";
import { useTranslations } from "next-intl";
import { type ColumnDef } from "@tanstack/react-table";

import { useState } from "react";
import { useFormatter } from "next-intl";
import { useOrders } from "@/features/orders/components/orders-provider/orders-provider";
import { OrderDetails } from "@/features/orders/components/order-details/order-details";
import { orderTotals } from "@/features/orders/utils";
import { actionPresentation, getActionState } from "./action-state";
import { Link } from "@/lib/i18n/navigations";
import { ActionFeedback } from "@/components/shared";

export function NeedActions() {
  const t = useTranslations("dashboard.actions");
  const f = useFormatter();
  const invoiceMessages = useTranslations("invoices");
  const { orders, ready, storageAvailable, moveOrder, sendInvoice } = useOrders();
  const [selected, setSelected] = useState<ActionRequiredOrder | null>(null);
  const [failed, setFailed] = useState(false);
  const data: ActionRequiredOrder[] = orders.flatMap((order) => {
    const state = getActionState(order);
    return state
      ? [
          {
            id: order.id,
            number: order.number,
            customer: order.customer?.name ?? t("customerPending"),
            state,
            issue: t(actionPresentation[state].description),
            amount: f.number(orderTotals(order.lines, order.shipping).total) + " " + t("currency"),
            updatedAt: f.dateTime(new Date(order.createdAt), {
              month: "short",
              day: "numeric",
              timeZone: "Asia/Tehran",
            }),
          },
        ]
      : [];
  });
  function act(order: ActionRequiredOrder) {
    setFailed(false);
    if (order.state === "sendInvoice") {
      const sent = sendInvoice(order.id);
      setFailed(!sent);
      if (sent) toast.add({ title: invoiceMessages("sentSuccess"), type: "success" });
    } else if (order.state === "packProducts" || order.state === "postPackage") {
      setFailed(!moveOrder(order.id, order.state === "packProducts" ? "packaged" : "courier"));
    } else setSelected(order);
  }
  const columns: ColumnDef<ActionRequiredOrder>[] = [
    {
      accessorKey: "number",
      header: t("table.order"),
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.number}</span>,
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
      header: () => <span className="block text-end">{t("table.action")}</span>,
      cell: ({ row }) => (
        <div className="text-end">
          <Button
            disabled={!ready}
            onClick={() => act(row.original)}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            {t(row.original.state)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={"space-y-4"}>
      <div className={"flex items-center justify-between"}>
        <div className={"flex items-center gap-2"}>
          <h2 className={"font-semibold"}>{t("title")}</h2>
          <Badge variant={"destructive"} className={"h-fit text-[10px]"}>
            {t("itemCount", { count: data.length })}
          </Badge>
        </div>
        <Link href="/orders" className={"flex items-center gap-0.5"}>
          <p className={"text-sm"}>{t("all")}</p>
          <ChevronLeft className={"size-3 ltr:rotate-180"} />
        </Link>
      </div>
      <p className="text-muted-foreground text-xs">{invoiceMessages("demo")}</p>
      <DataTable
        data={data}
        columns={columns}
        caption={t("title")}
        getRowId={(order) => order.id}
        search={{ getValue: (order) => [order.number, order.customer, order.issue].join(" ") }}
        renderMobile={(order) => (
          <NeedActionCard order={order} disabled={!ready} onAction={() => act(order)} />
        )}
      />
      {!ready && <p role="status">{t("loading")}</p>}
      {ready && !data.length && <p className="text-muted-foreground py-6 text-sm">{t("empty")}</p>}
      {(!storageAvailable || failed) && <ActionFeedback kind="error" message={t("actionFailed")} />}
      <OrderDetails
        order={
          selected?.state === "customerInformation"
            ? orders.find((order) => order.id === selected.id)
            : undefined
        }
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
