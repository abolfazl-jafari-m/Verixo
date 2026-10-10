import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

export function SalesProgress() {
  const t = useTranslations("dashboard.salesOverview");

  return (
    <div className={"w-full space-y-4 text-neutral-700 dark:text-neutral-500"}>
      <div className={"flex items-center gap-4"}>
        <p className={"text-xs text-neutral-700 dark:text-neutral-500"}>{t("currentMonth")}</p>
        <Progress value={100} className={"flex-1"} />
        <p className={"text-xs"}>22.456</p>
      </div>
      <div className={"flex items-center gap-4"}>
        <p className={"text-xs"}>{t("previousMonth")}</p>
        <Progress value={75} className={"flex-1"} />
        <p className={"text-xs"}>18.843</p>
      </div>
    </div>
  );
}
