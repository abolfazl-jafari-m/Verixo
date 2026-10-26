"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { AppState, ActionFeedback } from "@/components/shared";
import { Button } from "@/components/ui/button";
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

import { ReportSkeleton } from "../report-skeleton/report-skeleton";

const ReportStoreContext = createContext<{
  store: ReturnType<typeof createReportStore>;
  selectReport: ReturnType<typeof createReportSelector>;
} | null>(null);
export function ReportProvider({ today, children }: { today: string; children: ReactNode }) {
  const t = useTranslations("settings");
  const states = useTranslations("appStates");
  const preferences = useSettingsSection("reports");
  if (!preferences.ready) return <ReportSkeleton />;
  return (
    <InitializedReportProvider today={today} preferences={preferences.value}>
      {!preferences.available && (
        <div className="space-y-2">
          <ActionFeedback kind="error" message={t("readError")} />
          <Button variant="outline" onClick={() => window.dispatchEvent(new Event("focus"))}>
            {states("retry")}
          </Button>
        </div>
      )}
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
  const states = useTranslations("appStates");
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  if (!ready) return <ReportSkeleton />;
  if (!report) return <AppState kind="error" title={t("invalidRange")} />;
  return (
    <>
      {!storageAvailable && (
        <div className="space-y-2">
          <ActionFeedback kind="error" message={states("readErrorHint")} />
          <Button variant="outline" onClick={() => window.dispatchEvent(new Event("focus"))}>
            {states("retry")}
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
