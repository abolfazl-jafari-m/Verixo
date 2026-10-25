import { createStore } from "zustand/vanilla";
import { presetRange } from "../date-range";
import type { RangePreset, ReportRange } from "../types";
import type { Settings } from "@/features/settings/model";
import type { Order } from "@/features/orders/types";
import type { Report } from "../types";
import { buildReport } from "../calculations";
import { demoReportSource } from "../data/demo-ledger";
import { previousRange, validRange } from "../date-range";

// Shared by the consumers of one report view, without storing derived financial data.
export function createReportSelector() {
  let cached:
    | {
        orders: Order[];
        range: ReportRange;
        current: { report: Report | null; previous: Report | null };
        comparison?: { report: Report | null; previous: Report | null };
      }
    | undefined;
  return (orders: Order[], range: ReportRange, compare: boolean) => {
    if (cached?.orders !== orders || cached.range !== range) {
      const report = validRange(range) ? buildReport(demoReportSource(orders), range) : null;
      cached = { orders, range, current: { report, previous: null } };
    }
    if (!compare) return cached.current;
    cached.comparison ??= {
      report: cached.current.report,
      previous: cached.current.report
        ? buildReport(demoReportSource(orders), previousRange(range))
        : null,
    };
    return cached.comparison;
  };
}
export interface ReportFilters {
  range: ReportRange;
  preset: RangePreset;
  compare: boolean;
}
export interface ReportActions {
  setRange: (range: ReportRange) => void;
  selectPreset: (preset: RangePreset) => void;
  setCompare: (compare: boolean) => void;
}
export function createReportStore(today: string, preferences: Settings["reports"]) {
  return createStore<ReportFilters & ReportActions>()((set) => ({
    range: presetRange(preferences.period, today),
    preset: preferences.period,
    compare: preferences.compare,
    setRange: (range) => set({ range }),
    setCompare: (compare) => set({ compare }),
    selectPreset: (preset) =>
      set(preset === "custom" ? { preset } : { preset, range: presetRange(preset, today) }),
  }));
}
