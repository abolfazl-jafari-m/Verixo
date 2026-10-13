"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useOrders } from "@/features/orders/components/orders-provider/orders-provider";
import { AppState, ContentSkeleton } from "@/components/shared";
import { useTranslations } from "next-intl";
import { buildReport } from "../../calculations";
import { demoReportSource } from "../../data/demo-ledger";
import { presetRange, previousRange, validRange } from "../../date-range";
import type { RangePreset, Report, ReportRange } from "../../types";
import { useSettingsSection } from "@/features/settings/use-settings";
import type { Settings } from "@/features/settings/model";

interface ReportContextValue {
  range: ReportRange;
  preset: RangePreset;
  setRange: (range: ReportRange) => void;
  selectPreset: (preset: RangePreset) => void;
  compare: boolean;
  setCompare: (value: boolean) => void;
  report: Report | null;
  previous: Report | null;
  ready: boolean;
  storageAvailable: boolean;
}
const ReportContext = createContext<ReportContextValue | null>(null);
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
  const { orders, ready, storageAvailable } = useOrders();
  const [preset, setPreset] = useState<RangePreset>(preferences.period);
  const [range, setRange] = useState(() => presetRange(preferences.period, today));
  const [compare, setCompare] = useState(preferences.compare);
  const source = demoReportSource(orders);
  const report = validRange(range) ? buildReport(source, range) : null;
  const previous = report && compare ? buildReport(source, previousRange(range)) : null;
  return (
    <ReportContext.Provider
      value={{
        range,
        preset,
        setRange,
        compare,
        setCompare,
        report,
        previous,
        ready,
        storageAvailable,
        selectPreset: (next) => {
          setPreset(next);
          if (next !== "custom") setRange(presetRange(next, today));
        },
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}
export function useReport() {
  const context = useContext(ReportContext);
  if (!context) throw new Error("ReportProvider required");
  return context;
}
export function ReportResults({ children }: { children: ReactNode }) {
  const { report, ready } = useReport();
  const t = useTranslations("reports");
  if (!ready) return <ContentSkeleton variant="cards" />;
  if (!report) return <AppState kind="error" title={t("invalidRange")} />;
  return children;
}
