"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductPerformance } from "../../types";
import { AppState } from "@/components/shared";
import { productKeys } from "../../export-data";
import { useReport } from "../report-provider/report-provider";
import { ReportSelect } from "../report-filters/report-filters";

export function ReportProducts() {
  const { report } = useReport();
  const t = useTranslations("reports");
  const locale = useLocale();
  const [sort, setSort] = useState("net");
  if (!report) return null;
  const sortKey = sort === "quantity" ? "quantity" : sort === "profit" ? "profit" : "net";
  const products = [...report.products].sort(
    (a, b) => (b[sortKey] ?? -Infinity) - (a[sortKey] ?? -Infinity) || a.id.localeCompare(b.id),
  );
  const columns: ColumnDef<ProductPerformance>[] = productKeys.map((key) => ({
    id: key,
    accessorFn: (row) => row[key],
    header: t(`columns.${key}`),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className={key === "name" ? "min-w-44 font-medium" : "tabular-nums"}>
          {product[key] === null ? (
            t("unavailable")
          ) : key === "name" ? (
            <div>
              <bdi>{product.name}</bdi>
              {product.variants.length > 0 && (
                <p className="text-muted-foreground mt-1 max-w-56 text-xs font-normal whitespace-normal">
                  <span>{t("variants")}: </span>
                  <bdi>{product.variants.join(" / ")}</bdi>
                </p>
              )}
            </div>
          ) : (
            new Intl.NumberFormat(
              locale,
              key === "share" || key === "costCoverage"
                ? { style: "percent", maximumFractionDigits: 1 }
                : { maximumFractionDigits: 0 },
            ).format(Number(product[key]))
          )}
        </div>
      );
    },
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("products")}</CardTitle>
        <CardDescription>
          {t("productsHint")} · {t("currency")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length ? (
          <>
            <div className="max-w-xs">
              <ReportSelect
                id="product-report-sort"
                label={t("sort")}
                value={sort}
                options={[
                  "net",
                  "quantity",
                  ...(products.some((row) => row.profit !== null) ? ["profit"] : []),
                ].map((value) => ({ value, label: t(`columns.${value}`) }))}
                onChange={setSort}
              />
            </div>
            <DataTable
              data={products}
              columns={columns}
              caption={t("products")}
              getRowId={(row) => row.id}
              search={{ getValue: (row) => row.name + " " + row.variants.join(" ") }}
            />
          </>
        ) : (
          <AppState title={t("noProducts")} description={t("tryRange")} />
        )}
      </CardContent>
    </Card>
  );
}
