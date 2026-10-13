import { FileBox, ShoppingCart } from "lucide-react";
export const CtaOptions = [
  { title: "newOrder", description: "newOrderHint", url: "/orders/create", icon: FileBox },
  {
    title: "newProduct",
    description: "newProductHint",
    url: "/products/create",
    icon: ShoppingCart,
  },
] as const;
