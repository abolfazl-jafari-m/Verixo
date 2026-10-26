"use client";

import { AppState, ContentSkeleton, ActionFeedback } from "@/components/shared";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Archive,
  CircleX,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Layers3,
  Package,
  Plus,
  Search,
  Truck,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/navigations";
import { useOrdersStore } from "../orders-provider/orders-provider";
import { OrderSelect } from "../order-select/order-select";
import { OrderDetails } from "../order-details/order-details";
import { OrdersBoard } from "../orders-board/orders-board";
import { orderDateKey } from "../../utils";
import { OrderDateFilter } from "./order-date-filter";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkLabelActions, ShippingLabelPreview } from "@/features/shipping-labels/components";
import { selectDisplayed, selectedOrders, toggleSelection } from "@/features/shipping-labels/model";
import { activeOrders, canArchiveOrder } from "../../archive";
import { ArchiveAction } from "../archive-action/archive-action";

export function OrdersWorkspace() {
  const t = useTranslations("orders");
  const shipping = useTranslations("shippingLabels");
  const archive = useTranslations("orderArchive");
  const [labelSelection, setLabelSelection] = useState<string[]>([]);
  const [previewIds, setPreviewIds] = useState<string[] | null>(null);
  const f = useFormatter();
  const allOrders = useOrdersStore((state) => state.orders);
  const ready = useOrdersStore((state) => state.ready);
  const moveOrder = useOrdersStore((state) => state.moveOrder);
  const createdNumber = useOrdersStore((state) => state.createdNumber);
  const dismissSuccess = useOrdersStore((state) => state.dismissSuccess);
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  const orders = activeOrders(allOrders);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("all");
  const [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filtered = orders.filter(
    (order) =>
      (!query ||
        `${order.number} ${order.customer?.name ?? ""}`.toLocaleLowerCase().includes(query)) &&
      (payment === "all" || order.payment === payment) &&
      (!date || orderDateKey(order.createdAt) >= date),
  );
  const hasFilters = !!search || payment !== "all" || !!date;
  const metrics = [
    { key: "allOrders", count: orders.length, icon: Layers3 },
    {
      key: "awaitingPayment",
      icon: Clock3,
      count: orders.filter((order) => order.status === "pending_payment").length,
    },
    {
      key: "awaitingPackaging",
      icon: Package,
      count: orders.filter((order) => order.status === "paid").length,
    },
    {
      key: "inDelivery",
      icon: Truck,
      count: orders.filter((order) => order.status === "courier").length,
    },
  ];
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">{t("demo")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="bg-muted/40 h-10 gap-2 rounded-xl"
            nativeButton={false}
            render={<Link href="/orders/cancelled" />}
          >
            <CircleX className="size-4" aria-hidden="true" />
            {t("cancellation.list")}
          </Button>
          <Button
            variant="ghost"
            className="bg-muted/40 h-10 gap-2 rounded-xl"
            nativeButton={false}
            render={<Link href="/orders/archive" />}
          >
            <Archive className="size-4" aria-hidden="true" />
            {archive("title")}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/orders/create" />}
            className="h-10 gap-2"
          >
            <Plus className="size-4" />
            {t("create")}
          </Button>
        </div>
      </div>
      {!storageAvailable && (
        <p role="alert" className="text-destructive text-sm">
          {t("customerFlow.storageUnavailable")}
        </p>
      )}
      {createdNumber && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-3 text-sm"
        >
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="flex-1">{t("created", { number: createdNumber })}</span>
          <Button size="icon-sm" variant="ghost" aria-label={t("close")} onClick={dismissSuccess}>
            <X className="size-4" />
          </Button>
        </div>
      )}
      <section aria-label={t("summary")} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.key} className="border-border/40 bg-card rounded-2xl border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">{t(metric.key)}</p>
              <metric.icon className="text-primary/70 size-4 shrink-0" />
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
              {ready ? f.number(metric.count) : "—"}
            </p>
          </div>
        ))}
      </section>
      <div className="grid grid-cols-2 items-end gap-3 lg:grid-cols-[minmax(200px,1fr)_200px_180px_auto]">
        <div className="col-span-2 flex flex-col gap-2 lg:col-span-1">
          <label htmlFor="order-search" className="text-sm font-medium">
            {t("search")}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-3 size-4" />
            <Input
              id="order-search"
              className="h-10 rounded-xl ps-9"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setLabelSelection([]);
              }}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>
        <OrderSelect
          id="order-payment-filter"
          label={t("payment")}
          value={payment}
          onChange={(value) => {
            setPayment(value);
            setLabelSelection([]);
          }}
          options={[
            { value: "all", label: t("allPayments") },
            { value: "pending", label: t("payments.pending") },
            { value: "paid", label: t("payments.paid") },
          ]}
        />
        <OrderDateFilter
          value={date}
          onChange={(value) => {
            setDate(value);
            setLabelSelection([]);
          }}
        />
        {hasFilters && (
          <Button
            variant="ghost"
            className="h-10"
            onClick={() => {
              setSearch("");
              setPayment("all");
              setDate("");
              setLabelSelection([]);
            }}
          >
            {t("clear")}
          </Button>
        )}
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <p>{t("shown", { count: filtered.length })}</p>
        <p>{t("moveHint")}</p>
      </div>
      {ready && filtered.length === 0 && (
        <AppState
          icon={Package}
          title={orders.length ? t("noResults") : t("noOrders")}
          description={t(orders.length ? "noResultsHint" : "noOrdersHint")}
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setPayment("all");
                  setDate("");
                  setLabelSelection([]);
                }}
              >
                {t("clear")}
              </Button>
            ) : (
              <Link href="/orders/create" className={buttonVariants()}>
                {t("create")}
              </Link>
            )
          }
        />
      )}
      {ready && (
        <div className="border-border/40 bg-muted/20 flex flex-wrap items-center gap-3 rounded-2xl border p-3">
          <Button
            variant="ghost"
            className="h-9 gap-2 rounded-xl"
            disabled={!filtered.some(canArchiveOrder)}
            onClick={() =>
              setLabelSelection(filtered.filter(canArchiveOrder).map((order) => order.id))
            }
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            {archive("selectEligible")}
          </Button>
          <ArchiveAction
            ids={selectedOrders(filtered, labelSelection).map((order) => order.id)}
            onSuccess={(changed) =>
              setLabelSelection((ids) => ids.filter((id) => !changed.includes(id)))
            }
          />
          <p className="text-muted-foreground ms-auto text-xs" role="status">
            {archive("selection", {
              selected: selectedOrders(filtered, labelSelection).length,
              eligible: selectedOrders(filtered, labelSelection).filter(canArchiveOrder).length,
            })}
          </p>
        </div>
      )}
      {ready && (
        <BulkLabelActions
          count={selectedOrders(filtered, labelSelection).length}
          total={filtered.length}
          onSelectAll={(checked) => setLabelSelection(selectDisplayed(filtered, checked))}
          onPreview={() =>
            setPreviewIds(selectedOrders(filtered, labelSelection).map((order) => order.id))
          }
        />
      )}
      {!ready ? (
        <ContentSkeleton variant="board" />
      ) : (
        <OrdersBoard
          orders={filtered}
          renderSelection={(order) => (
            <Checkbox
              aria-label={shipping("selectOrder", { number: order.number })}
              checked={labelSelection.includes(order.id)}
              onCheckedChange={() => setLabelSelection((ids) => toggleSelection(ids, order.id))}
            />
          )}
          onOpen={setSelectedId}
          onMove={(id, status) => {
            const moved = moveOrder(id, status);
            setMoveError(moved ? "" : t("customerFlow.blocked"));
            if (moved)
              toast.add({
                title: t("dragEnded", { status: t(`statuses.${status}`) }),
                type: "success",
              });
          }}
        />
      )}
      {moveError && <ActionFeedback kind="error" message={moveError} />}
      <OrderDetails
        order={allOrders.find((order) => order.id === selectedId)}
        onClose={() => setSelectedId(null)}
        onPrintLabel={(id) => {
          setSelectedId(null);
          setPreviewIds([id]);
        }}
      />
      {previewIds && (
        <ShippingLabelPreview
          orders={selectedOrders(orders, previewIds)}
          onClose={() => setPreviewIds(null)}
        />
      )}
    </div>
  );
}
