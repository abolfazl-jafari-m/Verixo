"use client";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AppState } from "@/components/shared";
import { formatReportDate } from "../../date-range";
import { orderDateKey } from "@/features/orders/utils";
import { useReport } from "../report-provider/report-provider";

export function ReportFinancials() {
  const { report } = useReport();
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
          <Table>
            <TableHeader>
              <TableRow>
                {["category", "amount", "date"].map((key) => (
                  <TableHead key={key} className="text-start">
                    {t(key)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.title || t(`categories.${expense.category}`)}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat(locale).format(expense.amount)} {t("currency")}
                  </TableCell>
                  <TableCell>
                    {formatReportDate(orderDateKey(expense.occurredAt), locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <AppState title={t(report.completeness.expenses ? "zeroExpenses" : "noExpenses")} />
        )}
      </CardContent>
    </Card>
  );
}
