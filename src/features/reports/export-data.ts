import type { Report } from "./types";
import { metricComparison } from "./calculations";
import { formatReportDate } from "./date-range";
import { orderDateKey } from "@/features/orders/utils";

export type Translate = (key: string) => string;
export type ReportCell = string | number | null;
export interface ReportTable {
  name: string;
  headers: string[];
  rows: ReportCell[][];
}
export const metricKeys = ["gross", "net", "payments", "profit", "orders", "average"] as const;
export const productKeys = [
  "name",
  "quantity",
  "gross",
  "discounts",
  "refunds",
  "net",
  "knownCost",
  "profit",
  "costCoverage",
  "share",
] as const;
export function reportTables(
  report: Report,
  previous: Report | null,
  t: Translate,
  locale: string,
  generatedAt: string,
): ReportTable[] {
  return [
    {
      name: t("summary"),
      headers: [t("metric"), t("value"), t("previous"), t("difference"), t("change")],
      rows: [
        [
          t("period"),
          `${formatReportDate(report.range.from, locale)} — ${formatReportDate(report.range.to, locale)}`,
        ],
        [
          t("previous"),
          previous
            ? `${formatReportDate(previous.range.from, locale)} — ${formatReportDate(previous.range.to, locale)}`
            : t("unavailable"),
        ],
        [t("generated"), generatedAt],
        [t("currency"), t("currency")],
        ...metricKeys.map((key) => {
          const change = metricComparison(report, previous, key);
          return [
            t(`metrics.${key}`),
            report.metrics[key],
            previous?.metrics[key] ?? null,
            change?.difference ?? null,
            change?.percent == null ? null : change.percent * 100,
          ];
        }),
        [t("metrics.cost"), report.metrics.cost],
        [t("metrics.knownCost"), report.metrics.knownCost],
        [t("metrics.grossProfit"), report.metrics.grossProfit],
        [
          t("metrics.costCoverage"),
          report.metrics.costCoverage === null ? null : report.metrics.costCoverage * 100,
        ],
        [t("coverageDefinition"), t("coverageExplanation")],
        [t("metrics.expenses"), report.metrics.expenses],
        [t("demo"), t("rules")],
        [t("periodHint"), t("adjustmentHint")],
        ...(!report.completeness.costs ? [[t("partial"), t("missingCosts")]] : []),
        ...(!report.completeness.expenses ? [[t("partial"), t("missingExpenses")]] : []),
        ...(!report.completeness.payments ? [[t("partial"), t("missingPayments")]] : []),
        ...(!report.completeness.adjustments ? [[t("partial"), t("missingAdjustments")]] : []),
        ...(!report.completeness.cancellations ? [[t("partial"), t("missingCancellations")]] : []),
      ],
    },
    {
      name: t("products"),
      headers: productKeys.map((key) => t(`columns.${key}`)),
      rows: report.products.map((row) =>
        productKeys.map((key) =>
          key === "name"
            ? [row.name, ...row.variants].join("\n")
            : key === "share" || key === "costCoverage"
              ? row[key] === null
                ? null
                : row[key] * 100
              : row[key],
        ),
      ),
    },
    {
      name: t("orderAnalytics"),
      headers: [t("metric"), t("value")],
      rows: [
        ...(["total", "paid", "unpaid", "cancelled", "cancelledInPeriod"] as const).map((key) => [
          t(`analytics.${key}`),
          report.analytics[key],
        ]),
        [
          t("analytics.cancellationRate"),
          report.analytics.cancellationRate === null
            ? null
            : report.analytics.cancellationRate * 100,
        ],
        [t("metrics.average"), report.metrics.average],
        [t("createdHint"), t("cancellationHint")],
      ],
    },
    {
      name: t("statusDistribution"),
      headers: [t("status"), t("count"), t("amount")],
      rows: report.statuses.map((row) => [t(`statuses.${row.status}`), row.count, row.amount]),
    },
    {
      name: t("expenses"),
      headers: [t("expenseTitle"), t("category"), t("amount"), t("date")],
      rows: report.expenses.map((row) => [
        row.title || t(`categories.${row.category}`),
        t(`categories.${row.category}`),
        row.amount,
        formatReportDate(orderDateKey(row.occurredAt), locale),
      ]),
    },
    {
      name: t("salesTrend"),
      headers: [t("from"), t("to"), ...metricKeys.map((key) => t(`metrics.${key}`)), t("created")],
      rows: report.trends.map((row) => [
        formatReportDate(row.date, locale),
        formatReportDate(row.end, locale),
        ...metricKeys.map((key) => row[key]),
        row.created,
      ]),
    },
  ];
}
export function csvCell(value: ReportCell) {
  let text = value === null ? "" : String(value);
  // Untrusted product names must not execute spreadsheet formulas.
  if (typeof value === "string" && /^[\s]*[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function reportCsv(tables: ReportTable[]) {
  return (
    "\uFEFF" +
    tables
      .map((table) =>
        [[table.name], table.headers, ...table.rows]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n"),
      )
      .join("\r\n\r\n")
  );
}
