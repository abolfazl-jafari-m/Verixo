export type TodayShipmentStatus = "packing" | "shipping" | "completed";
export interface ShipmentStep {
  id: string | number;
  title: string;
  status: TodayShipmentStatus;
}
