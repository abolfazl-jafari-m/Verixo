import { allocateOrderDiscount } from "@/features/orders/totals";
import { orderStatuses } from "@/features/orders/types";
import { daysInRange, inRange, nextMonth, shiftDay, validRange } from "./date-range";
import type { ProductPerformance, Report, ReportRange, ReportSource } from "./types";

function summarize(source: ReportSource, range: ReportRange) {
  const created = source.orders.filter((order) => inRange(order.createdAt, range));
  const cancelledIds = new Set(source.cancellations.map((event) => event.orderId));
  // A paid flag is a sales eligibility rule, never evidence of a dated cash receipt.
  const valid = created.filter(
    (order) =>
      order.payment === "paid" && order.status !== "cancelled" && !cancelledIds.has(order.id),
  );
  const financials = new Map(
    source.lines.map((line) => [`${line.orderId}:${line.lineIndex}`, line]),
  );
  const products = new Map<string, ProductPerformance>();
  let adjustmentsComplete = true;
  for (const order of valid) {
    const orderDiscounts = allocateOrderDiscount(order.lines, order.discountPercentage);
    order.lines.forEach((line, index) => {
      const fact = financials.get(`${order.id}:${index}`);
      if (!fact) adjustmentsComplete = false;
      const gross = line.unitPrice * line.quantity;
      const discounts = (fact?.discount ?? 0) + orderDiscounts[index];
      const refunds = fact?.refund ?? 0;
      const net = gross - discounts - refunds;
      const unitCost = line.unitCostSnapshot;
      const cost = unitCost == null ? null : unitCost * line.quantity;
      const product = products.get(line.productId) ?? {
        id: line.productId,
        name: line.name,
        variants: [],
        quantity: 0,
        gross: 0,
        discounts: 0,
        refunds: 0,
        net: 0,
        cost: 0,
        knownCost: 0,
        knownQuantity: 0,
        costCoverage: null,
        adjustmentsComplete: true,
        profit: null,
        share: 0,
      };
      product.quantity += line.quantity;
      if (line.variantId && !product.variants.includes(line.variantLabel || line.variantId))
        product.variants.push(line.variantLabel || line.variantId);
      if (cost !== null) {
        product.knownCost += cost;
        product.knownQuantity += line.quantity;
      }
      product.costCoverage = product.knownQuantity / product.quantity;
      product.adjustmentsComplete = product.adjustmentsComplete && fact !== undefined;
      product.gross += gross;
      product.discounts += discounts;
      product.refunds += refunds;
      product.net += net;
      product.cost = product.cost === null || cost === null ? null : product.cost + cost;
      product.profit =
        product.cost === null || !product.adjustmentsComplete ? null : product.net - product.cost;
      products.set(product.id, product);
    });
  }
  const rows = [...products.values()];
  const sum = (key: "gross" | "net" | "discounts" | "refunds") =>
    rows.reduce((total, row) => total + row[key], 0);
  const gross = sum("gross"),
    net = sum("net");
  const cost = rows.some((row) => row.cost === null)
    ? null
    : rows.reduce((total, row) => total + (row.cost ?? 0), 0);
  const knownCost = rows.reduce((total, row) => total + row.knownCost, 0);
  const quantity = rows.reduce((total, row) => total + row.quantity, 0);
  const knownQuantity = rows.reduce((total, row) => total + row.knownQuantity, 0);
  const costCoverage = quantity ? knownQuantity / quantity : null;
  const grossProfit = cost === null || !adjustmentsComplete ? null : net - cost;
  rows.forEach((row) => {
    row.share = net > 0 ? row.net / net : 0;
  });
  const expenses = source.expenses.filter((expense) => inRange(expense.occurredAt, range));
  // Inventory purchases are cash movements, not an additional expense on top of COGS.
  const otherExpenses = expenses
    .filter((expense) => expense.category !== "inventory")
    .reduce((total, expense) => total + expense.amount, 0);
  const payments = source.payments
    .filter((payment) => inRange(payment.confirmedAt, range))
    .reduce((total, payment) => total + payment.amount, 0);
  const cancelled = created.filter((order) => cancelledIds.has(order.id)).length;
  return {
    metrics: {
      gross,
      net,
      discounts: sum("discounts"),
      refunds: sum("refunds"),
      cost,
      knownCost,
      grossProfit,
      costCoverage,
      quantity,
      knownQuantity,
      expenses: otherExpenses,
      payments,
      profit:
        grossProfit === null || !source.completeness.expenses ? null : grossProfit - otherExpenses,
      orders: valid.length,
      average: valid.length ? net / valid.length : 0,
    },
    products: rows,
    expenses,
    completeness: {
      ...source.completeness,
      costs: cost !== null,
      adjustments: adjustmentsComplete,
    },
    analytics: {
      total: created.length,
      paid: created.filter((order) => order.payment === "paid").length,
      unpaid: created.filter((order) => order.payment === "pending").length,
      cancelled: source.completeness.cancellations ? cancelled : null,
      cancellationRate:
        source.completeness.cancellations && created.length ? cancelled / created.length : null,
      cancelledInPeriod: source.completeness.cancellations
        ? source.cancellations.filter((event) => inRange(event.cancelledAt, range)).length
        : null,
    },
    statuses: orderStatuses.map((status) => ({
      status,
      count: created.filter((order) => order.status === status).length,
      amount: created
        .filter((order) => order.status === status)
        .reduce(
          (total, order) =>
            total + order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
          0,
        ),
    })),
  };
}
export function buildReport(source: ReportSource, range: ReportRange): Report {
  if (!validRange(range)) throw new Error("Invalid report range");
  const days = daysInRange(range);
  const aggregation = days <= 45 ? "daily" : days <= 180 ? "weekly" : "monthly";
  const trends: Report["trends"] = [];
  for (let date = range.from; date <= range.to;) {
    const next =
      aggregation === "monthly"
        ? nextMonth(date)
        : shiftDay(date, aggregation === "weekly" ? 7 : 1);
    const end = shiftDay(next, -1) < range.to ? shiftDay(next, -1) : range.to;
    const bucket = summarize(source, { from: date, to: end });
    trends.push({ date, end, ...bucket.metrics, created: bucket.analytics.total });
    date = next;
  }
  return { range, ...summarize(source, range), trends, aggregation };
}
export function comparison(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  return {
    difference: current - previous,
    percent: previous === 0 ? null : (current - previous) / Math.abs(previous),
  };
}

export function metricComparison(
  report: Report,
  previous: Report | null,
  key: "gross" | "net" | "payments" | "profit" | "orders" | "average" | "grossProfit" | "cost",
) {
  if (!previous) return null;
  if (key === "payments" && (!report.completeness.payments || !previous.completeness.payments))
    return null;
  if (
    (key === "net" || key === "average") &&
    (!report.completeness.adjustments || !previous.completeness.adjustments)
  )
    return null;
  return comparison(report.metrics[key], previous.metrics[key]);
}
