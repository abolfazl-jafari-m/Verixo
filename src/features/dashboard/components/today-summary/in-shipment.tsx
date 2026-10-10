import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

export function InShipment() {
  const t = useTranslations("dashboard.todaySummary");

  return (
    <div className={"border-warning-800 bg-warning-500/30 space-y-2 rounded-lg border p-2"}>
      <div className={"text-warning-800 dark:text-warning-500 flex items-center justify-between"}>
        <Package className={"text-warning-800 dark:text-warning-500 size-4"} />
        <p className={"font-bold"}>5</p>
      </div>

      <p className={"text-xs"}>{t("readyToShip")}</p>
    </div>
  );
}
