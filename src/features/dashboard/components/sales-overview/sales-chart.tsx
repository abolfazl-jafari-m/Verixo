"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    color: "var(--primary-600)",
  },
} satisfies ChartConfig;

export function SalesChart() {
  const t = useTranslations("dashboard.salesChart");
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  if (!isDesktop) {
    return null;
  }

  const chartData = [
    { day: t("days.saturday"), revenue: 3200000 },
    { day: t("days.sunday"), revenue: 4100000 },
    { day: t("days.monday"), revenue: 2800000 },
    { day: t("days.tuesday"), revenue: 5300000 },
    { day: t("days.wednesday"), revenue: 4900000 },
    { day: t("days.thursday"), revenue: 6100000 },
    { day: t("days.friday"), revenue: 4500000 },
  ];

  return (
    <Card className="border-primary-200/70 from-card via-card to-primary-50/50 dark:border-primary-400/15 dark:to-primary-950/20 h-full! bg-linear-to-bl shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72">
          <AreaChart accessibilityLayer data={chartData} margin={{ top: 12, right: 8, left: -12 }}>
            <defs>
              <linearGradient id="sales-revenue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} interval={0} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `${Math.round(value / 1000000)}M`}
              width={34}
            />
            <Tooltip
              cursor={{ stroke: "var(--primary-400)", strokeDasharray: "4 4" }}
              formatter={(value) => [
                `${Number(value ?? 0).toLocaleString("fa-IR")} ${t("currency")}`,
                t("revenue"),
              ]}
            />
            <Area
              dataKey="revenue"
              fill="url(#sales-revenue)"
              fillOpacity={1}
              stroke="var(--color-revenue)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
