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
    title: "مدیریت فروش",
    items: [
      {
        title: "محصولات",
        url: "/products",
        icon: Package,
        getDescription: (stats) => `${stats.products} محصول فعال`,
      },
      {
        title: "سفارش‌ها",
        url: "/orders",
        icon: ShoppingCart,
        getDescription: (stats) => `${stats.orders} سفارش`,
      },
      {
        title: "مشتریان",
        url: "/customers",
        icon: Users,
        getDescription: (stats) => `${stats.customers} مشتری`,
      },
    ],
  },
  {
    title: "مالی",
    items: [
      {
        title: "گزارش‌ها",
        url: "/reports",
        icon: ChartBar,
      },
      {
        title: "فاکتورها",
        url: "/invoices",
        icon: FileText,
      },
      {
        title: "پرداخت‌ها",
        url: "/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "حساب کاربری",
    items: [
      {
        title: "تنظیمات",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "پشتیبانی",
        url: "/support",
        icon: LifeBuoy,
      },
    ],
  },
];
