"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
            <Table>
              <TableHeader>
                <TableRow>
                  {productKeys.map((key) => (
                    <TableHead key={key} className="text-start">
                      {t(`columns.${key}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    {productKeys.map((key) => (
                      <TableCell
                        key={key}
                        className={
                          key === "name" ? "min-w-44 font-medium" : "text-start tabular-nums"
                        }
                      >
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
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <AppState title={t("noProducts")} description={t("tryRange")} />
        )}
      </CardContent>
    </Card>
  );
}
