import type { LucideIcon } from "lucide-react";

export type NavigationLabel =
  | "salesManagement"
  | "finance"
  | "account"
  | "products"
  | "orders"
  | "customers"
  | "reports"
  | "invoices"
  | "payments"
  | "settings"
  | "support";

export type SidebarStats = {
  products: number;
  orders: number;
  customers: number;
};

type MenuItem = {
  title: NavigationLabel;
  url: string;
  descriptionKey?: "activeProducts" | "orderCount" | "customerCount";
  statKey?: keyof SidebarStats;
  icon: LucideIcon;
};

export type Menu = {
  titleKey: NavigationLabel;
  items?: MenuItem[];
};
