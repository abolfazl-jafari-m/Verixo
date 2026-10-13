import { orderDateKey } from "@/features/orders/utils";
import type { RangePreset, ReportRange } from "./types";

const DAY = 86400000;
export function shiftDay(day: string, count: number) {
  return new Date(Date.parse(`${day}T12:00:00Z`) + count * DAY).toISOString().slice(0, 10);
}
export function daysInRange(range: ReportRange) {
  return Math.round((Date.parse(range.to) - Date.parse(range.from)) / DAY) + 1;
}
export function validRange(range: ReportRange) {
  return (
    [range.from, range.to].every(
      (day) =>
        /^\d{4}-\d{2}-\d{2}$/.test(day) &&
        !Number.isNaN(Date.parse(day)) &&
        new Date(day).toISOString().slice(0, 10) === day,
    ) &&
    daysInRange(range) > 0 &&
    daysInRange(range) <= 3660
  );
}
// Matches the application's Persian calendar, independent of browser time zone.
export function monthStart(day: string) {
  const dayOfMonth = Number(
    new Intl.DateTimeFormat("en-u-ca-persian", { day: "numeric", timeZone: "UTC" }).format(
      new Date(`${day}T12:00:00Z`),
    ),
  );
  return shiftDay(day, 1 - dayOfMonth);
}
export function nextMonth(day: string) {
  return monthStart(shiftDay(monthStart(day), 32));
}
export function presetRange(preset: Exclude<RangePreset, "custom">, today: string): ReportRange {
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "week":
      return { from: shiftDay(today, -6), to: today };
    case "month":
      return { from: shiftDay(today, -29), to: today };
    case "currentMonth":
      return { from: monthStart(today), to: today };
    case "previousMonth": {
      const to = shiftDay(monthStart(today), -1);
      return { from: monthStart(to), to };
    }
  }
}
export function previousRange(range: ReportRange): ReportRange {
  return { from: shiftDay(range.from, -daysInRange(range)), to: shiftDay(range.from, -1) };
}
export function inRange(timestamp: string, range: ReportRange) {
  const day = orderDateKey(timestamp);
  return day >= range.from && day <= range.to;
}
export function formatReportDate(day: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    calendar: "persian",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}
