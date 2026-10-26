"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { AppState, ContentSkeleton, DataTable, ActionSpinner } from "@/components/shared";
import { PackageSearch } from "lucide-react";
import { Link } from "@/lib/i18n/navigations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProductSelect } from "@/features/products/components/product-select/product-select";
import { productService, productQueryKey } from "@/features/products/services/product-service";
import { inventoryRows, inventoryStatus, inventorySummary, inventoryValues } from "../../domain";
import { StockAdjustment } from "../stock-adjustment/stock-adjustment";

const statusStyles = {
  out: "bg-destructive/10 text-destructive",
  low: "bg-warning-50 text-warning-800 dark:bg-warning-900/25 dark:text-warning-300",
  in: "bg-success-50 text-success-800 dark:bg-success-900/25 dark:text-success-300",
  untracked: "bg-muted text-muted-foreground",
};
type Row = ReturnType<typeof inventoryRows>[number];
export function InventoryWorkspace({ initialStatus = "all" }: { initialStatus?: string }) {
  const t = useTranslations("inventory");
  const p = useTranslations("products");
  const f = useFormatter();
  const query = useQuery({ queryKey: productQueryKey, queryFn: productService.list });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState("name");
  const [editing, setEditing] = useState<Row | null>(null);
  const products = query.data ?? [];
  const all = inventoryRows(products);
  const summary = inventorySummary(products);
  const rows = all
    .filter(
      (row) =>
        (type === "all" || row.product.type === type) &&
        (status === "all" ||
          (row.active &&
            (status === "alerts"
              ? ["low", "out"].includes(inventoryStatus(row.item))
              : inventoryStatus(row.item) === status))) &&
        `${row.product.name} ${row.product.sku ?? ""} ${row.item.sku ?? ""} ${row.label}`
          .normalize("NFKC")
          .toLocaleLowerCase()
          .includes(search.trim().normalize("NFKC").toLocaleLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.product.name.localeCompare(b.product.name)
        : inventoryValues(a.item).available - inventoryValues(b.item).available,
    );
  function identity(row: Row) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarImage src={row.product.images[0]} alt="" />
          <AvatarFallback>{row.product.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium break-words whitespace-normal">{row.product.name}</p>
          <p className="text-muted-foreground text-xs break-words whitespace-normal">
            {row.label || p("types.simple")}
            {!row.active && ` · ${t("inactive")}`}
          </p>
          <bdi className="text-muted-foreground text-xs">
            {row.item.sku || row.product.sku || "—"}
          </bdi>
        </div>
      </div>
    );
  }
  function action(row: Row) {
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${t("adjust")} ${row.product.name} ${row.label}`}
        onClick={() => setEditing(row)}
      >
        {t("adjust")}
      </Button>
    );
  }
  const columns: ColumnDef<Row>[] = [
    { id: "name", header: p("name"), cell: ({ row }) => identity(row.original) },
    ...(["stock", "reserved", "available", "threshold"] as const).map((key) => ({
      id: key,
      header: t(key === "stock" ? "physical" : key),
      cell: ({ row }: { row: { original: Row } }) =>
        key === "available" && !inventoryValues(row.original.item).tracked
          ? "—"
          : f.number(inventoryValues(row.original.item)[key]),
    })),
    {
      id: "status",
      header: t("status"),
      cell: ({ row }) => (
        <Badge variant="ghost" className={statusStyles[inventoryStatus(row.original.item)]}>
          {t(inventoryStatus(row.original.item))}
        </Badge>
      ),
    },
    { id: "actions", header: p("actions"), cell: ({ row }) => action(row.original) },
  ];
  return (
    <section className="space-y-6" aria-label={t("title")}>
      <p className="text-muted-foreground text-sm">{t("demo")}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["tracked", "low", "out"] as const).map((key) => (
          <div key={key} className="bg-card border-border/50 rounded-2xl border p-5">
            <p className="text-muted-foreground text-sm">{t(`${key}Count`)}</p>
            <p className="mt-2 text-2xl font-semibold">
              {query.data ? f.number(summary[key]) : "—"}
            </p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">{t("metricsHint")}</p>
      <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2 text-xs">
          {t("search")}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
          />
        </label>
        <ProductSelect
          label={p("type")}
          value={type}
          onValueChange={setType}
          options={["all", "simple", "variable"].map((value) => ({
            value,
            label: value === "all" ? t("all") : p(`types.${value}`),
          }))}
        />
        <ProductSelect
          label={t("status")}
          value={status}
          onValueChange={setStatus}
          options={["all", "alerts", "low", "out", "in", "untracked"].map((value) => ({
            value,
            label: t(value),
          }))}
        />
        <ProductSelect
          label={t("sort")}
          value={sort}
          onValueChange={setSort}
          options={[
            { value: "name", label: p("name") },
            { value: "available", label: t("available") },
          ]}
        />
      </div>
      {query.isPending ? (
        <ContentSkeleton columns={7} />
      ) : query.isError ? (
        <AppState
          kind="error"
          title={t("loadError")}
          action={
            <Button
              disabled={query.isFetching}
              aria-busy={query.isFetching}
              onClick={() => query.refetch()}
            >
              {query.isFetching && <ActionSpinner />}
              {p("retry")}
            </Button>
          }
        />
      ) : rows.length ? (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.key}
          caption={t("title")}
          renderMobile={(row) => (
            <div className="space-y-3 p-4">
              {identity(row)}
              <Badge variant="ghost" className={statusStyles[inventoryStatus(row.item)]}>
                {t(inventoryStatus(row.item))}
              </Badge>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {(["stock", "reserved", "available", "threshold"] as const).map((key) => (
                  <div key={key}>
                    <dt className="text-muted-foreground">
                      {t(key === "stock" ? "physical" : key)}
                    </dt>
                    <dd>
                      {key === "available" && !inventoryValues(row.item).tracked
                        ? "—"
                        : f.number(inventoryValues(row.item)[key])}
                    </dd>
                  </div>
                ))}
              </dl>
              {action(row)}
            </div>
          )}
        />
      ) : (
        <AppState
          icon={PackageSearch}
          title={t(all.length ? "noResults" : "empty")}
          description={t(all.length ? "noResultsHint" : "emptyHint")}
          action={
            all.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setType("all");
                  setStatus("all");
                  setSort("name");
                }}
              >
                {p("clearFilters")}
              </Button>
            ) : (
              <Link href="/products/create" className={buttonVariants()}>
                {p("create")}
              </Link>
            )
          }
        />
      )}
      {editing && (
        <StockAdjustment
          key={editing.key}
          row={all.find((row) => row.key === editing.key) ?? editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}
