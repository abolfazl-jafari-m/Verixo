import { expect, it, vi } from "vitest";
import { createReportStore, createReportSelector } from "./report-store";
import type { Order } from "@/features/orders/types";
vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
it("isolates report filters and keeps active filters independent of saved defaults", () => {
  const first = createReportStore("2026-10-25", { period: "month", compare: true });
  const second = createReportStore("2026-10-25", { period: "month", compare: true });
  const initial = second.getState().range;
  first.getState().selectPreset("today");
  first.getState().setCompare(false);
  expect(first.getState().range).not.toEqual(initial);
  expect(second.getState().range).toEqual(initial);
  expect(second.getState().compare).toBe(true);
  first.getState().selectPreset("custom");
  first.getState().setRange(initial);
  expect(first.getState().range).toEqual(initial);
});
it("shares derived calculations across consumers while invalidating changed inputs", () => {
  const select = createReportSelector();
  const orders: Order[] = [];
  const range = { from: "2026-10-01", to: "2026-10-25" };
  const first = select(orders, range, true);
  expect(select(orders, range, true)).toBe(first);
  expect(select(orders, range, false).previous).toBeNull();
  expect(select([], range, true)).not.toBe(first);
});
