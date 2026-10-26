import { useFormatter, useTranslations } from "next-intl";
import { Check, MapPin, Package, Truck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "../../types";
import { statusPresentation } from "../../status-presentation";
import { orderTotals } from "../../utils";

function ProductPreview({ order, compact = false }: { order: Order; compact?: boolean }) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const visibleLines = order.lines.slice(0, compact ? 1 : 2);
  return (
    <span className="flex min-w-0 flex-col gap-2">
      {visibleLines.map((line, index) => (
        <span key={`${line.productId}-${index}`} className="flex items-start gap-2 text-xs">
          <span className="bg-muted text-muted-foreground min-w-6 shrink-0 rounded px-1 py-0.5 text-center tabular-nums">
            {f.number(line.quantity)}×
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate">{line.name}</span>
            {!compact && line.variantLabel && (
              <span className="text-muted-foreground mt-0.5 block truncate text-[10px]">
                {line.variantLabel}
              </span>
            )}
          </span>
        </span>
      ))}
      {order.lines.length > visibleLines.length && (
        <span className="text-muted-foreground text-[10px]">
          {t("moreProducts", { count: order.lines.length - visibleLines.length })}
        </span>
      )}
    </span>
  );
}

export function OrderCardContent({ order }: { order: Order }) {
  const t = useTranslations("orders");
  const f = useFormatter();
  const presentation = statusPresentation[order.status];
  const Icon = presentation.icon;
  const totals = orderTotals(order.lines, order.shipping, order.discountPercentage);
  const customer = order.customerInformationStatus === "submitted" ? order.customer : null;
  const customerName = customer?.name ?? t("customerFlow.awaiting");
  const amount = (
    <>
      {f.number(totals.total)}{" "}
      <span className="text-muted-foreground text-[10px] font-normal">{t("currency")}</span>
    </>
  );
  const totalRow = (
    <span className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{t("total")}</span>
      <span className="font-semibold tabular-nums">{amount}</span>
    </span>
  );
  const shipping = (
    <span className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{t("customerFlow.shippingMethod")}</span>
      <span className="font-medium">
        {order.shippingMethod
          ? t(`customerFlow.methods.${order.shippingMethod}.label`)
          : t("cards.shippingUnknown")}
      </span>
    </span>
  );
  const indicator = (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
        presentation.badge,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {t(presentation.label)}
    </span>
  );

  switch (order.status) {
    case "pending_payment":
      return (
        <>
          <span className={cn("flex flex-col gap-3 rounded-xl p-3", presentation.column)}>
            {indicator}
            <span className="text-muted-foreground text-[11px]">{t("total")}</span>
            <span className="text-2xl font-bold tracking-tight tabular-nums">{amount}</span>
            <span className="text-xs font-medium">{t(presentation.headline)}</span>
          </span>
          <span className="truncate text-sm font-semibold">{customerName}</span>
          <ProductPreview order={order} compact />
          <span
            className="border-border/50 text-muted-foreground border-t border-dashed pt-3 text-xs"
            role="status"
          >
            {t(`invoice.${order.invoiceStatus}`)}
          </span>
        </>
      );
    case "paid":
      return (
        <>
          <span className="flex items-center justify-between gap-2">
            {indicator}
            <span className="text-muted-foreground text-[10px]">
              {t("itemCount", { count: totals.count })}
            </span>
          </span>
          <span className="text-sm font-semibold">{t(presentation.headline)}</span>
          <ProductPreview order={order} />
          <span
            className={cn("flex items-start gap-2 rounded-lg p-2.5 text-xs", presentation.column)}
          >
            {customer ? (
              <Check className="mt-0.5 size-3.5 shrink-0" />
            ) : (
              <UserRound className="mt-0.5 size-3.5 shrink-0" />
            )}
            <span className="min-w-0 space-y-1">
              <span className="block font-medium">
                {t(`customerFlow.${order.customerInformationStatus}`)}
              </span>
              <span className="text-muted-foreground block truncate text-[10px]">
                {customer ? customerName : t("cards.collectDetails")}
              </span>
            </span>
          </span>
          {totalRow}
        </>
      );
    case "packaged":
      return (
        <>
          <span
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center",
              presentation.column,
            )}
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-xl",
                presentation.badge,
              )}
            >
              <Icon className="size-6" />
            </span>
            <span className="text-sm font-semibold">{t(presentation.headline)}</span>
            <span className="text-muted-foreground text-[11px]">
              {t(presentation.label)} · {t("itemCount", { count: totals.count })}
            </span>
          </span>
          <ProductPreview order={order} compact />
          <span className="border-border/50 space-y-2 border-t border-dashed pt-3">
            {shipping}
            <span className="text-muted-foreground block truncate text-xs">{customerName}</span>
          </span>
        </>
      );
    case "courier":
      return (
        <>
          {indicator}
          <span className="flex gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "flex w-7 shrink-0 flex-col items-center gap-1 rounded-full py-2",
                presentation.badge,
              )}
            >
              <Check className="size-3" />
              <span className="min-h-6 w-px flex-1 bg-current opacity-30" />
              <Truck className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-3 py-1">
              <span className="text-sm font-semibold">{t(presentation.headline)}</span>
              {shipping}
              <span className="text-muted-foreground text-[10px]">
                {t("cards.awaitingDelivery")}
              </span>
            </span>
          </span>
          <span className="bg-muted/40 flex items-start gap-2 rounded-lg p-3">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{customerName}</span>
              {customer && (
                <>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {[customer.province, customer.city].filter(Boolean).join(" · ")}
                  </span>
                  <span className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5 break-words">
                    {customer.address}
                  </span>
                </>
              )}
            </span>
          </span>
          <span className="text-muted-foreground flex items-center gap-2 text-[11px]">
            <Package className="size-3.5" />
            {t("itemCount", { count: totals.count })}
          </span>
        </>
      );
    case "delivered":
      return (
        <>
          <span className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                presentation.badge,
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{t(presentation.headline)}</span>
              <span className="text-muted-foreground block truncate text-xs">{customerName}</span>
            </span>
          </span>
          <ProductPreview order={order} compact />
          <span className="border-border/40 border-t pt-3">{totalRow}</span>
        </>
      );
  }
}
