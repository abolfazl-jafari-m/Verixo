import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

const statistics = [
  { key: "revenue", value: "۲۲٬۴۵۶٬۰۰۰", trend: "۱۸٪+", positive: true },
  { key: "averageOrder", value: "۱۲۲٬۰۰۰", trend: "۵٪+", positive: true },
  { key: "orders", value: "۱۸۱", trend: "۱۲٪−", positive: false },
  { key: "customers", value: "۲۶+", trend: "۸٪+", positive: true },
] as const;

export function KpiOverview() {
  const t = useTranslations("dashboard.kpi");

  return (
    <section className="grid grid-cols-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {statistics.map((statistic, index) => {
        const Icon = statistic.positive ? ArrowUpRight : ArrowDownRight;

        return (
          <div
            className={`min-w-0 px-5 py-5 ${index > 0 ? "border-s border-border" : ""}`}
            key={statistic.key}
          >
            <p className="text-muted-foreground truncate text-xs">{t(`${statistic.key}.label`)}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{statistic.value}</p>
            <div
              className={`mt-2 flex items-center gap-1 text-xs ${
                statistic.positive ? "text-success-600" : "text-destructive"
              }`}
            >
              <Icon className="size-3" />
              <span>{statistic.trend}</span>
              <span className="text-muted-foreground">{t(`${statistic.key}.comparison`)}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
