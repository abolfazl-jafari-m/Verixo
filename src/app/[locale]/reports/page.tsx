import { getTranslations } from "next-intl/server";
import { orderDateKey } from "@/features/orders/utils";
import {
  ReportProvider,
  ReportResults,
  ReportFilters,
  ReportSummary,
  ReportTrends,
  ReportProducts,
  ReportOrders,
  ReportFinancials,
} from "@/features/reports/components";

export default async function Page() {
  const t = await getTranslations("reports");
  return (
    <div className="mx-auto w-full max-w-[1400px] min-w-0 space-y-6 px-4 py-5 pb-28 sm:px-6 md:pb-8 lg:px-8 lg:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm leading-6">{t("description")}</p>
      </header>
      <ReportProvider today={orderDateKey(new Date().toISOString())}>
        <ReportFilters />
        <ReportResults>
          <ReportSummary />
          <ReportTrends />
          <ReportProducts />
          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <ReportOrders />
            <ReportTrends orders />
          </div>
          <ReportFinancials />
        </ReportResults>
      </ReportProvider>
    </div>
  );
}
