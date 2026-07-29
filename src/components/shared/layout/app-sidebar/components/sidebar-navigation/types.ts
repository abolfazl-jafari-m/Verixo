import type { LucideIcon } from "lucide-react";

export type SidebarStats = {
  products: number;
  orders: number;
  customers: number;
};

type MenuItem = {
  title: string;
  url: string;
  getDescription?: (stats: SidebarStats) => string;
  icon: LucideIcon;
};

export type Menu = {
  title: string;
  items?: MenuItem[];
};
