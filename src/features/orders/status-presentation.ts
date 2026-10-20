import { BadgeCheck, CreditCard, Package, PackageCheck, Truck } from "lucide-react";
import type { OrderStatus } from "./types";

export const statusPresentation = {
  pending_payment: {
    headline: "cards.pending_payment",
    label: "statuses.pending_payment",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: CreditCard,
    column: "bg-amber-500/5 ring-amber-500/20 dark:bg-amber-500/7",
    accent: "border-t-amber-500/70",
  },
  paid: {
    headline: "cards.paid",
    label: "statuses.paid",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: Package,
    column: "bg-sky-500/5 ring-sky-500/20 dark:bg-sky-500/7",
    accent: "border-t-sky-500/70",
  },
  packaged: {
    headline: "cards.packaged",
    label: "statuses.packaged",
    badge: "bg-primary/10 text-[var(--primary-700)] dark:text-[var(--primary-300)]",
    icon: PackageCheck,
    column: "bg-primary/5 ring-primary/20 dark:bg-primary/8",
    accent: "border-t-primary/70",
  },
  courier: {
    headline: "cards.courier",
    label: "statuses.courier",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    icon: Truck,
    column: "bg-orange-500/5 ring-orange-500/20 dark:bg-orange-500/7",
    accent: "border-t-orange-500/70",
  },
  cancelled: {
    headline: "cards.cancelled",
    label: "statuses.cancelled",
    badge: "bg-destructive/10 text-destructive",
    icon: Package,
    column: "bg-muted/20",
    accent: "border-t-destructive/70",
  },
  delivered: {
    headline: "cards.delivered",
    label: "statuses.delivered",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: BadgeCheck,
    column: "bg-emerald-500/5 ring-emerald-500/20 dark:bg-emerald-500/7",
    accent: "border-t-emerald-500/70",
  },
} satisfies Record<
  OrderStatus,
  {
    icon: typeof Package;
    column: string;
    accent: string;
    badge: string;
    label: `statuses.${OrderStatus}`;
    headline: `cards.${OrderStatus}`;
  }
>;
