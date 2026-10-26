"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ChevronLeft, CircleCheck } from "lucide-react";
import {
  NeedActionCard,
  type ActionRequiredOrder,
} from "@/features/dashboard/components/need-actions/need-action-card/need-action-card";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { useFormatter } from "next-intl";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { OrderDetails } from "@/features/orders/components/order-details/order-details";
import { orderTotals } from "@/features/orders/utils";
import { actionPresentation, getActionState } from "./action-state";
import { Link } from "@/lib/i18n/navigations";
import { AppState, ContentSkeleton, ActionFeedback } from "@/components/shared";

export function NeedActions() {
  const t = useTranslations("dashboard.actions");
  const f = useFormatter();
  const invoiceMessages = useTranslations("invoices");
  const orders = useOrdersStore((state) => state.orders);
  const ready = useOrdersStore((state) => state.ready);
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  const moveOrder = useOrdersStore((state) => state.moveOrder);
  const sendInvoice = useOrdersStore((state) => state.sendInvoice);
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
            amount:
              f.number(orderTotals(order.lines, order.shipping, order.discountPercentage).total) +
              " " +
              t("currency"),
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
      {ready && data.length > 0 && (
        <>
          <div className="border-border/50 bg-card hidden min-w-0 overflow-hidden rounded-xl border lg:block">
            <Table>
              <TableCaption className="sr-only">{t("title")}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("table.order")}</TableHead>
                  <TableHead scope="col">{t("table.customer")}</TableHead>
                  <TableHead scope="col">{t("table.issue")}</TableHead>
                  <TableHead scope="col">{t("table.amount")}</TableHead>
                  <TableHead scope="col">{t("table.updatedAt")}</TableHead>
                  <TableHead scope="col" className="text-end">
                    {t("table.action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium tabular-nums">{order.number}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{order.issue}</TableCell>
                    <TableCell className="font-semibold tabular-nums">{order.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{order.updatedAt}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        disabled={!ready}
                        onClick={() => act(order)}
                        className="h-8 gap-1.5 px-3 text-xs"
                      >
                        {t(order.state)}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {data.map((order) => (
              <li key={order.id}>
                <NeedActionCard order={order} disabled={!ready} onAction={() => act(order)} />
              </li>
            ))}
          </ul>
        </>
      )}
      {!ready && <ContentSkeleton columns={6} />}
      {ready && !data.length && <AppState icon={CircleCheck} title={t("empty")} className="py-8" />}
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
