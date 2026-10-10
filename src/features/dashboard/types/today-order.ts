import { TodayShipmentStatus } from "@/features/dashboard/types/shipment-step";

export interface TodayOrder {
  id: string | number;
  status?: TodayShipmentStatus;
  customer_name: string;
  order_address: string;
  order_shipment: string;
}
