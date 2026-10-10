import { Fragment } from "react";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShipmentStep, TodayShipmentStatus } from "@/features/dashboard/types/shipment-step";
import { useTranslations } from "next-intl";

type ShipmentProgressProps = {
  steps: ShipmentStep[];
  currentStatus?: ShipmentStep["status"];
};

const colors: Record<
  TodayShipmentStatus,
  {
    step: string;
    separator: string;
  }
> = {
  shipping: {
    step: "data-[active=true]:border-primary-800 dark:data-[active=true]:border-primary-400 data-[active=true]:bg-primary-300 data-[active=true]:text-primary-700",
    separator: "bg-primary-700 dark:bg-primary-300",
  },
  completed: {
    step: "data-[active=true]:border-secondary-800 dark:data-[active=true]:border-secondary-400 data-[active=true]:bg-secondary-300 data-[active=true]:text-secondary-700",
    separator: "bg-secondary-700  dark:bg-secondary-300",
  },

  packing: {
    step: "data-[active=true]:border-warning-800 dark:data-[active=true]:border-warning-400 data-[active=true]:bg-warning-300 data-[active=true]:text-warning-700",
    separator: "bg-warning-700  dark:bg-warning-300",
  },
};
export function ShipmentProgress({ steps, currentStatus }: ShipmentProgressProps) {
  const t = useTranslations("dashboard.shipments");
  const activeStepIndex = steps.findIndex((item) => item.status === currentStatus);
  const avtiveColor = currentStatus ? colors[currentStatus] : undefined;
  return (
    <div className={"flex w-full items-start justify-center"}>
      {steps.map((item, i) => (
        <Fragment key={item.id}>
          <div className={"flex shrink-0 flex-col items-center gap-1.5"}>
            <div
              data-active={activeStepIndex >= i}
              className={cn(
                "border-border group flex size-5 items-center justify-center rounded-full border transition-all duration-200 ease-in",
                avtiveColor?.step,
              )}
            >
              <CheckIcon className={"hidden size-2 group-data-[active=true]:block"} />
            </div>
            <p className={"text-xs"}>{t(item.status)}</p>
          </div>

          {i < steps.length - 1 && (
            <Separator
              className={cn(
                "mt-2 min-w-4 flex-1 shrink-0",
                activeStepIndex > i && avtiveColor?.separator,
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
