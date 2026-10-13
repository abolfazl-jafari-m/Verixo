import { ClipboardList, CreditCard, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DailyFocus() {
  const t = useTranslations("dashboard.dailyFocus");
  const items = [
    {
      icon: ClipboardList,
      count: "۶",
      label: t("invoice"),
      description: t("invoiceDescription"),
      className: "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-200",
    },
    {
      icon: CreditCard,
      count: "۴",
      label: t("payment"),
      description: t("paymentDescription"),
      className: "bg-warning-100 text-warning-800 dark:bg-warning-500/20 dark:text-warning-200",
    },
    {
      icon: PackageCheck,
      count: "۵",
      label: t("shipment"),
      description: t("shipmentDescription"),
      className:
        "bg-secondary-100 text-secondary-800 dark:bg-secondary-500/20 dark:text-secondary-200",
    },
  ];

  return (
    <Card className="border-primary-200/70 from-card via-card to-primary-50/50 dark:border-primary-400/15 dark:to-primary-950/20 h-full bg-linear-to-bl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{t("title")}</span>
          <Badge
            variant="outline"
            className="text-primary-700 border-primary-200 dark:text-primary-200 dark:border-primary-400/30"
          >
            {t("total", { count: 15 })}
          </Badge>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1">
        <ul className="flex w-full flex-col justify-center gap-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li
                className="bg-background/50 border-border/70 flex items-center gap-3 rounded-xl border p-3"
                key={item.label}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.className}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-muted-foreground truncate text-xs">{item.description}</p>
                </div>
                <span className="text-lg font-bold tabular-nums">{item.count}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
