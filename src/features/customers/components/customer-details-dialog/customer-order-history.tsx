import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/features/orders/types";
import { orderTotals } from "@/features/orders/utils";
import { statusPresentation } from "@/features/orders/status-presentation";
import { customerDateOptions } from "../../utils";

export function CustomerPurchaseHistory({ orders }: { orders: Order[] }) {
  const t = useTranslations("customers");
  const f = useFormatter();
  const locale = useLocale();
  const purchases = orders.filter((order) => order.payment === "paid");
  return (
    <section className="space-y-3" aria-labelledby="customer-purchases-title">
      <h3 id="customer-purchases-title" className="text-sm font-semibold">
        {t("purchaseHistory")}
      </h3>
      {purchases.length ? (
        <ul className="divide-border/40 border-border/50 divide-y rounded-xl border px-4">
          {purchases.flatMap((order) =>
            order.lines.map((line, index) => (
              <li key={`${order.id}-${index}`} className="flex items-start gap-3 py-3">
                <span className="bg-muted/50 text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <Package className="size-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium break-words">{line.name}</p>
                  {line.variantLabel && (
                    <p className="text-muted-foreground text-xs">{line.variantLabel}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    <bdi>{order.number}</bdi> ·{" "}
                    {f.dateTime(new Date(order.createdAt), customerDateOptions(locale))}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {f.number(line.quantity)} × {f.number(line.unitPrice)} {t("currency")}
                  </p>
                </div>
                <p className="shrink-0 text-end text-xs font-medium tabular-nums">
                  {f.number(line.quantity * line.unitPrice)}
                  <span className="text-muted-foreground mt-1 block text-[10px] font-normal">
                    {t("currency")}
                  </span>
                </p>
              </li>
            )),
          )}
        </ul>
      ) : (
        <p className="text-muted-foreground bg-muted/25 rounded-xl p-4 text-sm">
          {t("noPaidPurchases")}
        </p>
      )}
    </section>
  );
}

export function CustomerOrdersList({
  orders,
  onOpenOrder,
}: {
  orders: Order[];
  onOpenOrder: (id: string) => void;
}) {
  const t = useTranslations("customers");
  const orderT = useTranslations("orders");
  const f = useFormatter();
  const locale = useLocale();
  return (
    <section className="space-y-3" aria-labelledby="customer-orders-title">
      <h3 id="customer-orders-title" className="text-sm font-semibold">
        {t("previousOrders")}
      </h3>
      <ul className="space-y-2">
        {orders.map((order) => {
          const totals = orderTotals(order.lines, order.shipping);
          const presentation = statusPresentation[order.status];
          const Icon = presentation.icon;
          return (
            <li key={order.id} className="border-border/50 space-y-3 rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => onOpenOrder(order.id)}
                  aria-label={orderT("viewOrder", { number: order.number })}
                >
                  <bdi>{order.number}</bdi>
                  <ArrowUpRight className="size-3.5 rtl:-rotate-90" />
                </Button>
                <time dateTime={order.createdAt} className="text-muted-foreground text-xs">
                  {f.dateTime(new Date(order.createdAt), customerDateOptions(locale))}
                </time>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  {orderT("itemCount", { count: totals.count })}
                </span>
                <span className="font-medium tabular-nums">
                  {f.number(totals.total)} {t("currency")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="ghost" className={presentation.badge}>
                  <Icon />
                  {orderT(presentation.label)}
                </Badge>
                <span className="text-muted-foreground text-[11px]">
                  {orderT("payment")}: {orderT(`payments.${order.payment}`)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
