import type { CustomerInformation, Order } from "@/features/orders/types";

export interface Customer extends Pick<CustomerInformation, "name" | "phone" | "city" | "address"> {
  id: string;
}

export interface CustomerOverview {
  customer: Customer;
  orders: Order[];
  totalSpent: number;
  deliveredCount: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
}
