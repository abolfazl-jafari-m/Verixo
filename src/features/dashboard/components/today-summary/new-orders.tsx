import { ArrowUp, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

export function NewOrders() {
  const t = useTranslations("dashboard.todaySummary");

  return (
    <div className={"border-primary-800 bg-primary-500/30 space-y-2 rounded-lg border p-2"}>
      <div className={"text-primary-800 dark:text-primary-500 flex items-center justify-between"}>
        <ClipboardList className={"size-4"} />
        <p className={"font-bold"}>12</p>
      </div>
      <div className={"space-y-1"}>
        <p className={"text-xs"}>{t("newOrders")}</p>
        <div
          className={"text-secondary-700 dark:text-success-500 flex items-center gap-1 text-[10px]"}
        >
          <ArrowUp className={"size-2.5"} />
          <p>{t("fromYesterday")}</p>
        </div>
      </div>
    </div>
  );
}
