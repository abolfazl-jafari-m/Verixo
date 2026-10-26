"use client";
import { ChartNoAxesCombined } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { AppState } from "@/components/shared";
import { formatReportDate } from "../../date-range";
import { useReportData } from "../report-provider/report-provider";
import { ReportSelect } from "../report-filters/report-filters";

export function ReportTrends({ orders = false }: { orders?: boolean }) {
  const { report } = useReportData();
  const t = useTranslations("reports");
  const locale = useLocale();
  const [series, setSeries] = useState("net");
  if (!report) return null;
  const selectedSeries =
    (series === "profit" && report.metrics.profit === null) ||
    (series === "grossProfit" && report.metrics.grossProfit === null) ||
    (series === "cost" && report.metrics.cost === null)
      ? "net"
      : series;
  const key = orders ? "created" : selectedSeries;
  const label = orders ? t("created") : t(`metrics.${key}`);
  const empty = orders
    ? !report.analytics.total
    : !report.analytics.total && !report.metrics.payments && !report.expenses.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(orders ? "orderTrend" : "salesTrend")}</CardTitle>
        <CardDescription>
          {t(`aggregation.${report.aggregation}`)} · {t(orders ? "createdHint" : "trendHint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!orders && (
          <div className="max-w-xs">
            <ReportSelect
              id="report-series"
              label={t("series")}
              value={selectedSeries}
              options={[
                "gross",
                "net",
                "payments",
                ...(report.metrics.cost !== null ? ["cost"] : []),
                ...(report.metrics.grossProfit !== null ? ["grossProfit"] : []),
                ...(report.metrics.profit !== null ? ["profit"] : []),
              ].map((value) => ({ value, label: t(`metrics.${value}`) }))}
              onChange={setSeries}
            />
          </div>
        )}
        {empty ? (
          <AppState
            icon={ChartNoAxesCombined}
            title={t("noActivity")}
            description={t("tryRange")}
          />
        ) : (
          <div dir="ltr">
            <ChartContainer
              config={{ [key]: { label, color: "var(--chart-3)" } }}
              className="h-64 w-full"
            >
              <AreaChart
                accessibilityLayer
                data={report.trends}
                margin={{ left: 4, right: 12, top: 8, bottom: 4 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  minTickGap={45}
                  tickFormatter={(day) => formatReportDate(String(day), locale)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={65}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat(locale, {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(value))
                  }
                  allowDecimals={!orders}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: 12,
                    direction: locale === "fa" ? "rtl" : "ltr",
                  }}
                  labelFormatter={(day) => {
                    const bucket = report.trends.find((item) => item.date === day);
                    return bucket
                      ? `${formatReportDate(bucket.date, locale)} — ${formatReportDate(bucket.end, locale)}`
                      : day;
                  }}
                  formatter={(value) => [
                    `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(value))}${orders ? "" : ` ${t("currency")}`}`,
                    label,
                  ]}
                />
                <Area
                  isAnimationActive={false}
                  type="linear"
                  dataKey={key}
                  name={label}
                  stroke="var(--chart-3)"
                  fill="var(--chart-3)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
