import type { LucideIcon } from "lucide-react";

export type NavigationLabel =
  | "dashboard"
  | "salesManagement"
  | "finance"
  | "account"
  | "inventory"
  | "products"
  | "orders"
  | "customers"
  | "reports"
  | "invoices"
  | "payments"
  | "settings"
  | "support";

type MenuItem = {
  title: NavigationLabel;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
  match?: "exact" | "section";
};

export type Menu = {
  titleKey: NavigationLabel;
  items?: MenuItem[];
};
