import { FileBox, FileText, LucideIcon, ShoppingCart } from "lucide-react";

type CtaOption = {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  className: string;
};

export const CtaOptions: CtaOption[] = [
  {
    title: "ثبت سفارش جدید",
    description: "ثبت دستی سفارش برای مشتری",
    url: "/orders/create",
    icon: FileBox,
    className: "from-primary-500 to-primary-900 border-primary-700",
  },
  {
    title: "افزودن محصول",
    description: "معرفی محصول جدید به فروشگاه",
    url: "/products/create",
    icon: ShoppingCart,
    className: "from-secondary-500 to-secondary-900 border-secondary-700",
  },
  {
    title: "ایجاد فاکتور",
    description: "ثبت فاکتور جدید",
    url: "/invoce/create",
    icon: FileText,
    className: "from-neutral-500 to-neutral-900 border-neutral-700",
  },
];
