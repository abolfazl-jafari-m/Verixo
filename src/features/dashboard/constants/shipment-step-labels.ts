import { TodayShipmentStatus } from "@/features/dashboard/types/shipment-step";

export const ShipmentStepLabels: Record<TodayShipmentStatus, string> = {
  packing: "آماده ارسال",
  shipping: "تحویل پیک",
  completed: "تحویل مشتری",
};
