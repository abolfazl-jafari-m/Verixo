"use client";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared";
import { AppState } from "@/components/shared";
import { formatReportDate } from "../../date-range";
import { orderDateKey } from "@/features/orders/utils";
import { useReportData } from "../report-provider/report-provider";

export function ReportFinancials() {
  const { report } = useReportData();
  const t = useTranslations("reports");
  const locale = useLocale();
  if (!report) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("financials")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(["cost", "grossProfit", "expenses", "profit"] as const).map((key) => (
            <div key={key}>
              <dt className="text-muted-foreground text-xs">{t(`metrics.${key}`)}</dt>
              <dd className="mt-2 text-lg font-semibold">
                {report.metrics[key] === null
                  ? t("unavailable")
                  : `${new Intl.NumberFormat(locale).format(report.metrics[key])} ${t("currency")}`}
              </dd>
              {key === "cost" && !report.completeness.costs && (
                <p className="text-muted-foreground mt-2 text-xs">
                  {t("metrics.knownCost")}:{" "}
                  {new Intl.NumberFormat(locale).format(report.metrics.knownCost)} {t("currency")}
                </p>
              )}
              {key === "expenses" && !report.completeness.expenses && (
                <p className="text-muted-foreground mt-2 text-xs">{t("partial")}</p>
              )}
            </div>
          ))}
        </dl>
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm font-medium">
            {t("metrics.costCoverage")}:{" "}
            {report.metrics.costCoverage === null
              ? t("noEligibleUnits")
              : new Intl.NumberFormat(locale, {
                  style: "percent",
                  maximumFractionDigits: 1,
                }).format(report.metrics.costCoverage)}
          </p>
          <p className="text-muted-foreground mt-2 text-xs leading-6">
            {t("coverageHint", {
              known: report.metrics.knownQuantity,
              total: report.metrics.quantity,
            })}
          </p>
        </div>
        <div className="bg-muted/40 space-y-2 rounded-xl p-4 text-xs leading-6">
          <p>{t("rules")}</p>
          <p>{t("adjustmentHint")}</p>
          {(
            [
              ["costs", "missingCosts"],
              ["expenses", "missingExpenses"],
              ["payments", "missingPayments"],
              ["adjustments", "missingAdjustments"],
              ["cancellations", "missingCancellations"],
            ] as const
          )
            .filter(([key]) => !report.completeness[key])
            .map(([, key]) => (
              <p key={key}>{t(key)}</p>
            ))}
        </div>
        <h3 className="font-medium">{t("expenses")}</h3>
        <p className="text-muted-foreground text-xs">{t("expensesHint")}</p>
        {report.expenses.length ? (
          <DataTable
            data={report.expenses}
            caption={t("expenses")}
            getRowId={(row) => row.id}
            search={{ getValue: (row) => row.title + " " + t(`categories.${row.category}`) }}
            columns={[
              {
                id: "category",
                accessorFn: (row) => row.category,
                header: t("category"),
                cell: ({ row }) => row.original.title || t(`categories.${row.original.category}`),
              },
              {
                id: "amount",
                header: t("amount"),
                cell: ({ row }) =>
                  new Intl.NumberFormat(locale).format(row.original.amount) + " " + t("currency"),
              },
              {
                id: "date",
                header: t("date"),
                cell: ({ row }) => formatReportDate(orderDateKey(row.original.occurredAt), locale),
              },
            ]}
          />
        ) : (
          <AppState title={t(report.completeness.expenses ? "zeroExpenses" : "noExpenses")} />
        )}
      </CardContent>
    </Card>
  );
}
