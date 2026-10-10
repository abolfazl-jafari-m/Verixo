import { TodayShipmentStatus } from "@/features/dashboard/types/shipment-step";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const variants: Record<TodayShipmentStatus, string> = {
  packing: "border-warning-800 bg-warning-700/10  dark:bg-warning-500/20  dark:border-warning-300",
  shipping: "border-primary-800 bg-primary-700/10  dark:bg-primary-500/20 dark:border-primary-300",
  completed:
    "border-secondary-800 bg-secondary-700/10  dark:bg-secondary-500/20  dark:border-secondary-300",
};
export function ShipmentLabel({ status }: { status?: TodayShipmentStatus }) {
  const t = useTranslations("dashboard.shipments");

  return (
    <Badge
      variant={status ? "outline" : "destructive"}
      className={cn("h-fit border px-2 py-1", status && variants[status])}
    >
      <span
        className={cn(
          "bg-foreground size-1.5 animate-pulse rounded-full",
          !status && "bg-destructive",
        )}
      />
      {status ? (
        <p className={"text-[8px]"}>{t(status)}</p>
      ) : (
        <p className={"text-[8px]"}>{t("preparing")}</p>
      )}
    </Badge>
  );
}
