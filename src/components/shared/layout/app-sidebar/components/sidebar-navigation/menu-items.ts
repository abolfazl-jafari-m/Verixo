import {
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
      {
        title: "products",
        url: "/products",
        icon: Package,
        descriptionKey: "activeProducts",
        statKey: "products",
      },
      {
        title: "orders",
        url: "/orders",
        icon: ShoppingCart,
        descriptionKey: "orderCount",
        statKey: "orders",
      },
      {
        title: "customers",
        url: "/customers",
        icon: Users,
        descriptionKey: "customerCount",
        statKey: "customers",
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
        icon: LifeBuoy,
      },
    ],
  },
];
