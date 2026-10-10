import { SVGProps } from "react";
import { Box, ChartPie, ShoppingBag, Users } from "lucide-react";

type MobileNavigationType =
  | {
      type: "link";
      titleKey: "products" | "orders" | "reports" | "customers";
      href: string;
      icon: React.ComponentType<SVGProps<SVGSVGElement>>;
    }
  | {
      type: "fab-space";
    };

export const mobileItems: MobileNavigationType[] = [
  {
    type: "link",
    titleKey: "products",
    href: "/products",
    icon: Box,
  },
  {
    type: "link",
    titleKey: "orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    type: "fab-space",
  },
  {
    type: "link",
    titleKey: "reports",
    href: "/reports",
    icon: ChartPie,
  },
  {
    type: "link",
    titleKey: "customers",
    href: "/customers",
    icon: Users,
  },
];
