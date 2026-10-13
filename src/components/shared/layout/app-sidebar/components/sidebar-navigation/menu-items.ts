import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  ChartBar,
  CreditCard,
  Settings,
  LifeBuoy,
} from "lucide-react";
import type { Menu } from "./types";

export const menu: Menu[] = [
  {
    titleKey: "salesManagement",
    items: [
      { title: "dashboard", url: "/dashboard", icon: LayoutDashboard, match: "exact" },
      {
        title: "products",
        url: "/products",
        icon: Package,
      },
      {
        title: "orders",
        url: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "customers",
        url: "/customers",
        icon: Users,
      },
    ],
  },
  {
    titleKey: "finance",
    items: [
      {
        title: "reports",
        url: "/reports",
        icon: ChartBar,
      },
      {
        title: "invoices",
        url: "/invoices",
        icon: FileText,
      },
      {
        title: "payments",
        url: "/payments",
        disabled: true,
        icon: CreditCard,
      },
    ],
  },
  {
    titleKey: "account",
    items: [
      {
        title: "settings",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "support",
        url: "/support",
        disabled: true,
        icon: LifeBuoy,
      },
    ],
  },
];
