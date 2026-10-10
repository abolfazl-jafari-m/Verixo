import { InPayment, InShipment, NewOrders } from "./";
import { useTranslations } from "next-intl";

export function TodaySummary() {
  const t = useTranslations("dashboard.todaySummary");

  return (
    <div className={"space-y-4"}>
      <div className={"flex items-center gap-2"}>
        <span className={"bg-success-600 size-1.5 animate-pulse rounded-full"} />
        <h2 className={"font-semibold"}>{t("title")}</h2>
      </div>
      <div className={"grid grid-cols-3 gap-4"}>
        <NewOrders />
        <InPayment />
        <InShipment />
      </div>
    </div>
  );
}
