"use client";

import { AppState, ContentSkeleton } from "@/components/shared";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { mockCustomers } from "../../data/mock-customers";
import { customerOverviews, normalizeCustomerSearch } from "../../utils";
import { CustomersTable } from "../customers-table/customers-table";
import { CustomerDetailsDialog } from "../customer-details-dialog/customer-details-dialog";

export function CustomersWorkspace() {
  const t = useTranslations("customers");
  const states = useTranslations("appStates");
  const locale = useLocale();
  const orders = useOrdersStore((state) => state.orders);
  const ready = useOrdersStore((state) => state.ready);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const customers = customerOverviews(orders, mockCustomers);
  const query = normalizeCustomerSearch(search);
  const filtered = customers.filter(
    ({ customer, orders: history }) =>
      (!query ||
        [customer.name, customer.phone, customer.city].some((value) =>
          normalizeCustomerSearch(value).includes(query),
        )) &&
      (filter === "all" || (filter === "withOrders" ? history.length > 0 : history.length === 0)),
  );
  const options = ["all", "withOrders", "withoutOrders"].map((value) => ({
    value,
    label: t(`filters.${value}`),
  }));
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm font-medium">
          {ready ? t("count", { count: customers.length }) : null}
        </p>
        <p className="text-muted-foreground text-xs">{t("demo")}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="customer-search" className="text-sm font-medium">
            {t("search")}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-3 size-4" />
            <Input
              id="customer-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 rounded-xl ps-9"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <label htmlFor="customer-filter" className="text-sm font-medium">
            {t("filter")}
          </label>
          <Select
            value={filter}
            items={options}
            onValueChange={(value) => {
              if (value !== null) setFilter(value);
            }}
          >
            <SelectTrigger id="customer-filter" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={"mb-0"}
              dir={locale === "fa" ? "rtl" : "ltr"}
              alignItemWithTrigger={false}
            >
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(search || filter !== "all") && (
          <Button
            variant="ghost"
            className="h-10"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
          >
            <X className="size-4" />
            {t("clear")}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs" role="status">
        {ready ? t("shown", { count: filtered.length }) : t("loading")}
      </p>
      {!ready ? (
        <ContentSkeleton />
      ) : filtered.length ? (
        <CustomersTable customers={filtered} onSelect={setSelectedId} />
      ) : (
        <AppState
          title={states(customers.length ? "noResults" : "emptyTitle")}
          description={states(customers.length ? "noResultsDescription" : "emptyDescription")}
          action={
            customers.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                {states("clear")}
              </Button>
            ) : undefined
          }
        />
      )}
      <CustomerDetailsDialog
        customer={customers.find((item) => item.customer.id === selectedId)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
