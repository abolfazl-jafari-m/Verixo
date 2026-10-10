import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentProgress } from "./shipment-progress";
import { TodayShipmentStatus } from "@/features/dashboard/types/shipment-step";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck } from "lucide-react";
import { TodayOrder } from "@/features/dashboard/types/today-order";
import { shipmentSteps } from "@/features/dashboard/constants/shipment-steps";
import { ShipmentLabel } from "@/features/dashboard/components/today-shipments/shipment-card/shipment-label";

const variants: Record<TodayShipmentStatus, string> = {
  packing:
    "border-warning-300/80 from-warning-50 to-card dark:border-warning-400/30 dark:from-warning-500/15 dark:to-card",
  shipping:
    "border-primary-300/80 from-primary-50 to-card dark:border-primary-400/30 dark:from-primary-500/15 dark:to-card",
  completed:
    "border-secondary-300/80 from-secondary-50 to-card dark:border-secondary-400/30 dark:from-secondary-500/15 dark:to-card",
};

export function ShipmentCard({ order }: { order: TodayOrder }) {
  const activeVariant = order.status ? variants[order.status] : undefined;
  return (
    <Card
      className={cn(
        "transform-gpu border bg-linear-to-b shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        activeVariant,
      )}
    >
      <CardHeader>
        <CardTitle>
          <ShipmentLabel status={order.status} />
        </CardTitle>
        <CardAction>
          <p className={"text-[8px]"}>#{order.id}</p>
        </CardAction>
      </CardHeader>
      <CardContent className={"space-y-4"}>
        <ShipmentProgress steps={shipmentSteps} currentStatus={order.status} />
        <Separator />
        <div className={"space-y-2"}>
          <h4 className={"text-sm font-semibold"}>{order.customer_name}</h4>
          <div className={"space-y-1"}>
            <div className={"flex items-center gap-1.5"}>
              <MapPin className={"size-2.5"} />
              <p className={"text-[9px]"}>{order.order_address}</p>
            </div>
            <div className={"flex items-center gap-1.5"}>
              <Truck className={"size-2.5"} />
              <p className={"text-[9px]"}>{order.order_shipment}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
