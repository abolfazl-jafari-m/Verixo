import type { Order, OrderLineAdjustments } from "@/features/orders/types";

export interface ReportRange {
  from: string;
  to: string;
}
export type RangePreset = "today" | "week" | "month" | "currentMonth" | "previousMonth" | "custom";
export interface LineFinancials extends OrderLineAdjustments {
  orderId: string;
  // Order lines currently have no IDs. The adapter uses their stable array position.
  lineIndex: number;
}
export interface ConfirmedPayment {
  id: string;
  orderId: string;
  amount: number;
  confirmedAt: string;
}
export interface Cancellation {
  orderId: string;
  cancelledAt: string;
}
export const expenseCategories = [
  "inventory",
  "packaging",
  "marketing",
  "shipping",
  "operations",
  "other",
] as const;
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: (typeof expenseCategories)[number];
  occurredAt: string;
  orderId?: string;
  productId?: string;
  notes?: string;
}
export interface ReportSource {
  orders: Order[];
  lines: LineFinancials[];
  payments: ConfirmedPayment[];
  expenses: Expense[];
  cancellations: Cancellation[];
  completeness: { payments: boolean; expenses: boolean; cancellations: boolean };
}
export interface ProductPerformance {
  id: string;
  name: string;
  variants: string[];
  quantity: number;
  gross: number;
  discounts: number;
  refunds: number;
  net: number;
  cost: number | null;
  knownCost: number;
  knownQuantity: number;
  costCoverage: number | null;
  adjustmentsComplete: boolean;
  profit: number | null;
  share: number;
}
export interface ReportMetrics {
  gross: number;
  discounts: number;
  refunds: number;
  net: number;
  payments: number;
  cost: number | null;
  knownCost: number;
  grossProfit: number | null;
  // Quantity-weighted: known-cost units / all eligible sold units. No sales => null.
  costCoverage: number | null;
  quantity: number;
  knownQuantity: number;
  expenses: number;
  profit: number | null;
  orders: number;
  average: number;
}
export interface Report {
  range: ReportRange;
  metrics: ReportMetrics;
  products: ProductPerformance[];
  expenses: Expense[];
  completeness: ReportSource["completeness"] & { costs: boolean; adjustments: boolean };
  analytics: {
    total: number;
    paid: number;
    unpaid: number;
    cancelled: number | null;
    cancellationRate: number | null;
    cancelledInPeriod: number | null;
  };
  statuses: { status: Order["status"]; count: number; amount: number }[];
  trends: (ReportMetrics & { date: string; end: string; created: number })[];
  aggregation: "daily" | "weekly" | "monthly";
}
