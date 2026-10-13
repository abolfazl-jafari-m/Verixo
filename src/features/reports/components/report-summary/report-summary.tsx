"use client";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { metricComparison } from "../../calculations";
import { useReport } from "../report-provider/report-provider";

export const summaryKeys = ["gross", "net", "payments", "profit", "orders", "average"] as const;
export function ReportSummary() {
  const { report, previous } = useReport();
  const t = useTranslations("reports");
  const locale = useLocale();
  if (!report) return null;
  const number = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  return (
    <section aria-label={t("summary")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {summaryKeys.map((key) => {
        const value = report.metrics[key];
        const change = metricComparison(report, previous, key);
        return (
          <Card key={key} size="sm">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm">
                {t(`metrics.${key}`)}
                {key === "payments" && !report.completeness.payments && (
                  <span className="ms-2 text-xs">· {t("partial")}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold tabular-nums">
                {value === null ? t("unavailable") : number(value)}
                {key !== "orders" && value !== null && (
                  <span className="text-muted-foreground ms-2 text-xs font-normal">
                    {t("currency")}
                  </span>
                )}
              </p>
              <p className="text-muted-foreground text-xs leading-5">{t(`definitions.${key}`)}</p>
              {change && (
                <p className="text-muted-foreground text-xs">
                  <bdi>
                    {change.difference > 0 ? "+" : ""}
                    {number(change.difference)}
                    {key !== "orders" ? ` ${t("currency")}` : ""}
                  </bdi>{" "}
                  ·{" "}
                  {change.percent === null
                    ? t("noBaseline")
                    : new Intl.NumberFormat(locale, {
                        style: "percent",
                        maximumFractionDigits: 1,
                        signDisplay: "exceptZero",
                      }).format(change.percent)}{" "}
                  {t("versus")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
