import { Package, Send, Truck, UserRound } from "lucide-react";
import type { Order } from "@/features/orders/types";
export const actionPresentation = {
  sendInvoice: { icon: Send, description: "invoiceNotSent", tone: "text-primary bg-primary/10" },
  customerInformation: {
    icon: UserRound,
    description: "customerInformationPending",
    tone: "text-warning-700 bg-warning-100 dark:text-warning-200 dark:bg-warning-900/30",
  },
  packProducts: {
    icon: Package,
    description: "packingPending",
    tone: "text-info-700 bg-info-100 dark:text-info-200 dark:bg-info-900/30",
  },
  postPackage: {
    icon: Truck,
    description: "shippingPending",
    tone: "text-success-700 bg-success-100 dark:text-success-200 dark:bg-success-900/30",
  },
} as const;
export type ActionState = keyof typeof actionPresentation;
export function getActionState(order: Order): ActionState | null {
  if (order.archivedAt || order.status === "courier" || order.status === "delivered") return null;
  if (order.payment === "pending") return order.invoiceStatus === "not_sent" ? "sendInvoice" : null;
  if (order.customerInformationStatus === "pending") return "customerInformation";
  if (order.status === "paid") return "packProducts";
  if (order.status === "packaged") return "postPackage";
  return null;
}
