import { ShipmentStep } from "@/features/dashboard/types/shipment-step";

export const shipmentSteps: ShipmentStep[] = [
  {
    id: 1,
    title: "بسته‌بندی",
    status: "packing",
  },
  {
    id: 2,
    title: "تحویل پیک",
    status: "shipping",
  },
  {
    id: 3,
    title: "رسیده",
    status: "completed",
  },
];
