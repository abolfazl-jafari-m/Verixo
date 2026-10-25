"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { AppState, ContentSkeleton } from "@/components/shared";
import { useTranslations } from "next-intl";
import { useStore } from "zustand";
import {
  createReportStore,
  createReportSelector,
  type ReportFilters,
  type ReportActions,
} from "../../store/report-store";
import { useSettingsSection } from "@/features/settings/use-settings";
import type { Settings } from "@/features/settings/model";

const ReportStoreContext = createContext<{
  store: ReturnType<typeof createReportStore>;
  selectReport: ReturnType<typeof createReportSelector>;
} | null>(null);
export function ReportProvider({ today, children }: { today: string; children: ReactNode }) {
  const preferences = useSettingsSection("reports");
  if (!preferences.ready) return <ContentSkeleton variant="cards" />;
  return (
    <InitializedReportProvider today={today} preferences={preferences.value}>
      {children}
    </InitializedReportProvider>
  );
}
function InitializedReportProvider({
  today,
  children,
  preferences,
}: {
  today: string;
  children: ReactNode;
  preferences: Settings["reports"];
}) {
  const [scope] = useState(() => ({
    store: createReportStore(today, preferences),
    selectReport: createReportSelector(),
  }));
  return <ReportStoreContext.Provider value={scope}>{children}</ReportStoreContext.Provider>;
}
export function useReportStore<T>(selector: (state: ReportFilters & ReportActions) => T) {
  const scope = useContext(ReportStoreContext);
  if (!scope) throw new Error("ReportProvider required");
  return useStore(scope.store, selector);
}
export function useReportData(withComparison = false) {
  const scope = useContext(ReportStoreContext);
  if (!scope) throw new Error("ReportProvider required");
  const range = useStore(scope.store, (state) => state.range);
  const compare = useStore(scope.store, (state) => withComparison && state.compare);
  const orders = useOrdersStore((state) => state.orders);
  return scope.selectReport(orders, range, compare);
}
export function ReportResults({ children }: { children: ReactNode }) {
  const { report } = useReportData();
  const ready = useOrdersStore((state) => state.ready);
  const t = useTranslations("reports");
  if (!ready) return <ContentSkeleton variant="cards" />;
  if (!report) return <AppState kind="error" title={t("invalidRange")} />;
  return children;
}
