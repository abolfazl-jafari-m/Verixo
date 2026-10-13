"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Phone, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderDetails } from "@/features/orders/components/order-details/order-details";
import type { CustomerOverview } from "../../types";
import { customerDateOptions } from "../../utils";
import { CustomerOrdersList, CustomerPurchaseHistory } from "./customer-order-history";

export function CustomerDetailsDialog({
  customer: overview,
  onClose,
}: {
  customer: CustomerOverview | undefined;
  onClose: () => void;
}) {
  const t = useTranslations("customers");
  const f = useFormatter();
  const locale = useLocale();
  const [orderId, setOrderId] = useState<string | null>(null);
  function close() {
    setOrderId(null);
    onClose();
  }
  return (
    <Dialog
      open={!!overview}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="flex max-h-[92dvh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {overview && (
          <>
            <div className="border-border/50 flex shrink-0 items-start justify-between gap-3 border-b p-5 sm:px-6">
              <DialogHeader>
                <DialogDescription className="text-xs">{t("details")}</DialogDescription>
                <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                  <UserRound className="text-muted-foreground size-5 shrink-0" />
                  {overview.customer.name}
                </DialogTitle>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-full"
                aria-label={t("close")}
                onClick={close}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain p-5 sm:p-6">
              <section aria-labelledby="customer-info-title" className="space-y-3">
                <h3 id="customer-info-title" className="text-sm font-semibold">
                  {t("information")}
                </h3>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-muted-foreground text-xs">{t("phone")}</dt>
                    <dd>
                      <a
                        href={`tel:${overview.customer.phone}`}
                        className="text-primary focus-visible:ring-ring inline-flex items-center gap-2 rounded outline-none focus-visible:ring-2"
                      >
                        <Phone className="size-3.5" />
                        <bdi>{overview.customer.phone}</bdi>
                      </a>
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-muted-foreground text-xs">{t("city")}</dt>
                    <dd>{overview.customer.city || t("notAvailable")}</dd>
                  </div>
                  {overview.customer.address && (
                    <div className="space-y-1 sm:col-span-2">
                      <dt className="text-muted-foreground text-xs">{t("address")}</dt>
                      <dd className="leading-6 break-words">{overview.customer.address}</dd>
                    </div>
                  )}
                  {overview.firstOrderAt && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">{t("firstOrder")}</dt>
                      <dd>
                        {f.dateTime(new Date(overview.firstOrderAt), customerDateOptions(locale))}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
              {overview.orders.length ? (
                <>
                  <section aria-labelledby="customer-summary-title" className="space-y-3">
                    <h3 id="customer-summary-title" className="text-sm font-semibold">
                      {t("purchaseSummary")}
                    </h3>
                    <dl className="bg-muted/30 grid grid-cols-2 gap-4 rounded-xl p-4 text-sm sm:grid-cols-4">
                      <div className="space-y-2">
                        <dt className="text-muted-foreground text-xs">{t("orderCount")}</dt>
                        <dd className="font-semibold tabular-nums">
                          {f.number(overview.orders.length)}
                        </dd>
                      </div>
                      <div className="space-y-2">
                        <dt className="text-muted-foreground text-xs">{t("totalSpent")}</dt>
                        <dd className="font-semibold tabular-nums">
                          {f.number(overview.totalSpent)}{" "}
                          <span className="text-xs font-normal">{t("currency")}</span>
                        </dd>
                      </div>
                      <div className="space-y-2">
                        <dt className="text-muted-foreground text-xs">{t("delivered")}</dt>
                        <dd className="font-semibold tabular-nums">
                          {f.number(overview.deliveredCount)}
                        </dd>
                      </div>
                      <div className="space-y-2">
                        <dt className="text-muted-foreground text-xs">{t("lastOrder")}</dt>
                        <dd className="text-xs leading-6">
                          {overview.lastOrderAt &&
                            f.dateTime(new Date(overview.lastOrderAt), customerDateOptions(locale))}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-muted-foreground text-[11px] leading-5">
                      {t("spendingHint")}
                    </p>
                  </section>
                  <CustomerPurchaseHistory orders={overview.orders} />
                  <CustomerOrdersList orders={overview.orders} onOpenOrder={setOrderId} />
                </>
              ) : (
                <p
                  role="status"
                  className="bg-muted/30 text-muted-foreground rounded-xl p-6 text-center text-sm leading-6"
                >
                  {t("noOrders")}
                </p>
              )}
            </div>
            <OrderDetails
              order={overview.orders.find((order) => order.id === orderId)}
              onClose={() => setOrderId(null)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
