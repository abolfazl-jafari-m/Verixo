import { SVGProps } from "react";
import { Box, ChartPie, ShoppingBag, Users } from "lucide-react";

type MobileNavigationType =
  | {
      type: "link";
      title: string;
      href: string;
      icon: React.ComponentType<SVGProps<SVGSVGElement>>;
    }
  | {
      type: "fab-space";
    };

export const mobileItems: MobileNavigationType[] = [
  {
    type: "link",
    title: "محصولات",
    href: "/products",
    icon: Box,
  },
  {
    type: "link",
    title: "سفارش ها",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    type: "fab-space",
  },
  {
    type: "link",
    title: "گزارش",
    href: "/stastiscs",
    icon: ChartPie,
  },
  {
    type: "link",
    title: "مشتریان",
    href: "/users",
    icon: Users,
  },
];
