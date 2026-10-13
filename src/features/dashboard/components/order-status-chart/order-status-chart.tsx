"use client";

import * as React from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  new: {
    color: "var(--primary-500)",
  },
  payment: {
    color: "var(--warning-500)",
  },
  ready: {
    color: "var(--secondary-500)",
  },
  shipped: {
    color: "var(--success-500)",
  },
} satisfies ChartConfig;

export function OrderStatusChart() {
  const t = useTranslations("dashboard.orderStatusChart");
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
    { key: "new", status: t("new"), orders: 12, fill: "var(--color-new)" },
    { key: "payment", status: t("payment"), orders: 8, fill: "var(--color-payment)" },
    { key: "ready", status: t("ready"), orders: 5, fill: "var(--color-ready)" },
    { key: "shipped", status: t("shipped"), orders: 24, fill: "var(--color-shipped)" },
  ];

  return (
    <Card className="border-secondary-200/70 from-card via-card to-secondary-50/50 dark:border-secondary-400/15 dark:to-secondary-950/20 h-full bg-linear-to-bl shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <PieChart>
            <Tooltip
              formatter={(value) => [Number(value ?? 0).toLocaleString("fa-IR"), t("orders")]}
            />
            <Pie
              cx="50%"
              cy="50%"
              data={chartData}
              dataKey="orders"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={4}
              stroke="var(--card)"
              strokeWidth={4}
              isAnimationActive={false}
            >
              {chartData.map((item) => (
                <Cell fill={item.fill} key={item.key} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 text-xs">
          {chartData.map((item) => (
            <div className="flex items-center justify-between gap-2" key={item.key}>
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.status}
              </span>
              <span className="font-semibold tabular-nums">
                {item.orders.toLocaleString("fa-IR")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
