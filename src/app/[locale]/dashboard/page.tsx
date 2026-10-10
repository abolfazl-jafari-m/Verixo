import React from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  KpiOverview,
  NeedActions,
  OrderStatusChart,
  SalesChart,
  SalesOverview,
  TodayShipments,
  TodaySummary,
} from "@/features/dashboard/components";
import { Link } from "@/lib/i18n/navigations";

function DashboardPage() {
  const t = useTranslations("dashboard.page");

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 pb-28 sm:px-6 sm:py-6 sm:pb-24 md:pb-8 lg:space-y-8 lg:px-8 lg:py-8">
      <header className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-primary-600 text-sm font-medium">{t("eyebrow")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
      </header>

      <section className="lg:hidden" aria-label={t("salesSection")}>
        <div className="min-w-0">
          <SalesOverview />
        </div>
      </section>

      <section className="hidden lg:block" aria-label={t("salesSection")}>
        <KpiOverview />
      </section>

      <section
        className="hidden min-w-0 gap-6 lg:grid lg:grid-cols-2"
        aria-label={t("chartsSection")}
      >
        <div className="min-w-0">
          <SalesChart />
        </div>
        <div className="min-w-0">
          <OrderStatusChart />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-12" aria-label={t("operationsSection")}>
        <div className="md:hidden">
          <TodaySummary />
        </div>
        <div className="min-w-0 lg:col-span-12">
          <TodayShipments />
        </div>
        <div className="min-w-0 lg:col-span-12">
          <NeedActions />
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
