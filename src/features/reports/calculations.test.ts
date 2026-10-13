import { describe, expect, it } from "vitest";
import { buildReport, comparison, metricComparison } from "./calculations";
import { inRange, presetRange, previousRange, validRange } from "./date-range";
import { reportCsv, reportTables } from "./export-data";
import { reportWorkbook } from "./exports";
import type { ReportSource } from "./types";

const range = { from: "2026-10-01", to: "2026-10-31" };
function source(): ReportSource {
  return {
    orders: [
      {
        number: "ORD-A",
        status: "paid",
        customer: null,
        customerInformationStatus: "pending",
        shippingMethod: null,
        customerFormToken: null,
        notes: "",
        invoiceStatus: "not_sent",
        invoice: {
          id: "invoice-a",
          orderId: "a",
          number: "INV-A",
          createdAt: "2026-10-10T10:00:00Z",
          publicToken: "test-a",
          settingsSnapshot: {
            template: "standard",
            shopName: { fa: "", en: "" },
            contact: "",
            introduction: { fa: "", en: "" },
            footer: { fa: "", en: "" },
          },
        },
        id: "a",
        createdAt: "2026-10-10T10:00:00+03:30",
        lines: [
          {
            productId: "p",
            variantId: "v1",
            name: "محصول",
            quantity: 2,
            unitPrice: 100,
            unitCostSnapshot: 30,
          },
        ],
        shipping: 80,
        payment: "paid",
      },
    ],
    lines: [{ orderId: "a", lineIndex: 0, discount: 20, refund: 10 }],
    payments: [
      { id: "receipt", orderId: "a", amount: 250, confirmedAt: "2026-11-01T00:00:00+03:30" },
    ],
    expenses: [
      {
        id: "expense",
        title: "Packaging",
        category: "packaging",
        amount: 15,
        occurredAt: "2026-10-12T12:00:00Z",
      },
    ],
    cancellations: [],
    completeness: { payments: true, expenses: true, cancellations: true },
  };
}
describe("report calculations", () => {
  it("uses item gross, discounts and refunds once; excludes shipping", () => {
    expect(buildReport(source(), range).metrics).toMatchObject({
      gross: 200,
      discounts: 20,
      refunds: 10,
      net: 170,
      cost: 60,
      knownCost: 60,
      grossProfit: 110,
      costCoverage: 1,
      expenses: 15,
      profit: 95,
      orders: 1,
      average: 170,
    });
  });
  it("uses payment confirmation dates independent of creation and invoice status", () => {
    const data = source();
    data.orders[0].invoiceStatus = "sent";
    expect(buildReport(data, range).metrics.payments).toBe(0);
    const next = buildReport(data, { from: "2026-11-01", to: "2026-11-01" });
    expect(next.metrics.payments).toBe(250);
    expect(next.metrics.gross).toBe(0);
  });
  it("does not count awaiting payment as a sale", () => {
    const data = source();
    data.orders[0].payment = "pending";
    expect(buildReport(data, range).metrics.gross).toBe(0);
    expect(buildReport(data, range).analytics.unpaid).toBe(1);
  });
  it("excludes cancelled orders; separates cancellation event dates from the creation cohort", () => {
    const data = source();
    data.cancellations = [{ orderId: "a", cancelledAt: "2026-11-05T10:00:00Z" }];
    const report = buildReport(data, range);
    expect(report.metrics.orders).toBe(0);
    expect(report.analytics.cancellationRate).toBe(1);
    expect(report.analytics.cancelledInPeriod).toBe(0);
    expect(
      buildReport(data, { from: "2026-11-01", to: "2026-11-30" }).analytics.cancelledInPeriod,
    ).toBe(1);
  });
  it("keeps unavailable cancellation history distinct from zero", () => {
    const data = source();
    data.completeness.cancellations = false;
    expect(buildReport(data, range).analytics.cancelled).toBeNull();
    expect(buildReport(data, range).analytics.cancellationRate).toBeNull();
  });
  it("withholds COGS and profit when a cost snapshot is missing", () => {
    const data = source();
    data.orders[0].lines[0] = { ...data.orders[0].lines[0], unitCostSnapshot: null };
    const report = buildReport(data, range);
    expect(report.metrics.cost).toBeNull();
    expect(report.metrics.profit).toBeNull();
    expect(report.products[0].profit).toBeNull();
    expect(report.metrics.net).toBe(170);
    expect(report.metrics.grossProfit).toBeNull();
    expect(report.metrics.knownCost).toBe(0);
    expect(report.metrics.costCoverage).toBe(0);
  });
  it("calculates quantity-weighted coverage and known COGS without treating missing costs as zero", () => {
    const data = source();
    data.orders[0].lines.push({
      productId: "second",
      name: "Unknown",
      quantity: 3,
      unitPrice: 200,
      unitCostSnapshot: null,
    });
    data.lines.push({ orderId: "a", lineIndex: 1, discount: 0, refund: 0 });
    const report = buildReport(data, range);
    expect(report.metrics).toMatchObject({
      knownCost: 60,
      cost: null,
      costCoverage: 0.4,
      quantity: 5,
      knownQuantity: 2,
      grossProfit: null,
      profit: null,
      net: 770,
    });
    expect(report.products.find((row) => row.id === "p")).toMatchObject({
      costCoverage: 1,
      profit: 110,
    });
    expect(report.products.find((row) => row.id === "second")).toMatchObject({
      costCoverage: 0,
      profit: null,
    });
  });
  it("recognizes explicit zero cost, withholds legacy missing snapshots, and keeps empty coverage unavailable", () => {
    const data = source();
    data.orders[0].lines[0] = { ...data.orders[0].lines[0], unitCostSnapshot: 0 };
    expect(buildReport(data, range).metrics).toMatchObject({
      cost: 0,
      costCoverage: 1,
      grossProfit: 170,
      profit: 155,
    });
    data.orders[0].lines[0] = { ...data.orders[0].lines[0], unitCostSnapshot: undefined };
    expect(buildReport(data, range).metrics.costCoverage).toBe(0);
    expect(
      buildReport(data, { from: "2026-09-01", to: "2026-09-10" }).metrics.costCoverage,
    ).toBeNull();
  });
  it("distinguishes no expenses with complete records from unknown expenses", () => {
    const data = source();
    data.expenses = [];
    expect(buildReport(data, range).metrics).toMatchObject({
      expenses: 0,
      grossProfit: 110,
      profit: 110,
    });
    data.completeness.expenses = false;
    expect(buildReport(data, range).metrics).toMatchObject({
      expenses: 0,
      grossProfit: 110,
      profit: null,
    });
  });
  it("withholds profit for missing expenses and adjustment records", () => {
    const data = source();
    data.completeness.expenses = false;
    expect(buildReport(data, range).metrics.profit).toBeNull();
    data.completeness.expenses = true;
    data.lines = [];
    expect(buildReport(data, range).completeness.adjustments).toBe(false);
    expect(buildReport(data, range).metrics.profit).toBeNull();
  });
  it("does not double-count inventory purchases as other expenses", () => {
    const data = source();
    data.expenses.push({ ...data.expenses[0], id: "stock", category: "inventory", amount: 500 });
    expect(buildReport(data, range).metrics.profit).toBe(95);
  });
  it("aggregates variants using each historical price and cost", () => {
    const data = source();
    data.orders[0].lines.push({
      productId: "p",
      variantId: "v2",
      name: "محصول",
      quantity: 1,
      unitPrice: 300,
      unitCostSnapshot: 80,
    });
    data.lines.push({ orderId: "a", lineIndex: 1, discount: 0, refund: 0 });
    const report = buildReport(data, range);
    expect(report.products).toHaveLength(1);
    expect(report.products[0]).toMatchObject({
      quantity: 3,
      gross: 500,
      net: 470,
      cost: 140,
      profit: 330,
      share: 1,
      variants: ["v1", "v2"],
      costCoverage: 1,
    });
  });
  it("handles empty ranges and zero comparison baselines", () => {
    expect(buildReport(source(), { from: "2026-09-01", to: "2026-09-05" }).metrics.average).toBe(0);
    expect(comparison(10, 0)).toEqual({ difference: 10, percent: null });
    expect(comparison(null, 5)).toBeNull();
  });
  it("does not report growth for incomplete payment coverage", () => {
    const data = source();
    data.completeness.payments = false;
    const report = buildReport(data, range);
    expect(metricComparison(report, report, "payments")).toBeNull();
    expect(metricComparison(report, report, "gross")).toEqual({ difference: 0, percent: 0 });
  });
  it("uses inclusive Tehran dates and equal-length preceding ranges", () => {
    expect(inRange("2026-09-30T20:30:00Z", range)).toBe(true);
    expect(inRange("2026-10-31T20:30:00Z", range)).toBe(false);
    expect(previousRange({ from: "2026-10-01", to: "2026-10-07" })).toEqual({
      from: "2026-09-24",
      to: "2026-09-30",
    });
    expect(presetRange("currentMonth", "2026-10-13")).toEqual({
      from: "2026-09-23",
      to: "2026-10-13",
    });
    expect(presetRange("previousMonth", "2026-10-13")).toEqual({
      from: "2026-08-23",
      to: "2026-09-22",
    });
    expect(validRange({ from: "2026-02-30", to: "2026-03-10" })).toBe(false);
    expect(validRange({ from: "2026-10-02", to: "2026-10-01" })).toBe(false);
  });
  it("keeps weekly and monthly totals consistent with summary totals", () => {
    for (const to of ["2026-11-30", "2027-10-01"]) {
      const report = buildReport(source(), { from: "2026-10-01", to });
      expect(report.trends.reduce((sum, row) => sum + row.net, 0)).toBe(report.metrics.net);
      expect(report.trends.reduce((sum, row) => sum + row.payments, 0)).toBe(
        report.metrics.payments,
      );
      expect(report.trends.at(-1)?.end).toBe(to);
    }
  });
});
describe("report exports", () => {
  it("reuses the visible report metrics and escapes CSV with UTF-8 BOM and formula protection", () => {
    const report = buildReport(source(), range);
    const tables = reportTables(report, null, (key) => key, "fa", "today");
    expect(tables[0].rows.find((row) => row[0] === "metrics.net")?.[1]).toBe(report.metrics.net);
    expect(tables[0].rows.find((row) => row[0] === "metrics.grossProfit")?.[1]).toBe(
      report.metrics.grossProfit,
    );
    expect(tables[0].rows.find((row) => row[0] === "metrics.knownCost")?.[1]).toBe(
      report.metrics.knownCost,
    );
    expect(tables[0].rows.find((row) => row[0] === "metrics.costCoverage")?.[1]).toBe(100);
    const csv = reportCsv([{ name: "محصول", headers: ["name"], rows: [['a,"b"\nc'], ["=1+1"]] }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"a,""b""\nc"');
    expect(csv).toContain('"\'=1+1"');
  });
  it("exports partial coverage and unavailable profit without manufacturing totals", () => {
    const data = source();
    data.orders[0].lines[0] = { ...data.orders[0].lines[0], unitCostSnapshot: null };
    const report = buildReport(data, range);
    const tables = reportTables(report, null, (key) => key, "en", "today");
    expect(tables[0].rows.find((row) => row[0] === "metrics.costCoverage")?.[1]).toBe(0);
    expect(tables[0].rows.find((row) => row[0] === "metrics.grossProfit")?.[1]).toBeNull();
    expect(tables[0].rows).toContainEqual(["partial", "missingCosts"]);
  });
  it("writes a valid XLSX with numeric values and RTL worksheets", async () => {
    const { Workbook } = await import("exceljs");
    const tables = reportTables(buildReport(source(), range), null, (key) => key, "fa", "today");
    const bytes = await reportWorkbook(tables, "fa");
    const workbook = new Workbook();
    await workbook.xlsx.load(bytes);
    expect(workbook.worksheets).toHaveLength(6);
    expect(workbook.worksheets[0].views[0].rightToLeft).toBe(true);
    expect(workbook.worksheets[1].getCell("F2").value).toBe(170);
  });
});
