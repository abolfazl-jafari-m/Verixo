import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export function SalesStats() {
  const t = useTranslations("dashboard.salesOverview");

  return (
    <>
      <div className={"flex flex-1 flex-col items-center gap-2 text-neutral-500"}>
        <span className={"text-foreground text-sm"}>181</span>
        <p className={"text-xs"}>{t("orders")}</p>
      </div>
      <Separator orientation={"vertical"} />
      <div className={"flex flex-1 flex-col items-center gap-2 text-neutral-500"}>
        <span className={"text-foreground text-sm"}>122K</span>
        <p className={"text-xs"}>{t("averageBasket")}</p>
      </div>
      <Separator orientation={"vertical"} />
      <div className={"flex flex-1 flex-col items-center gap-2 text-neutral-500"}>
        <span className={"text-success-500 text-sm"}>+26</span>
        <p className={"text-xs"}>{t("newCustomers")}</p>
      </div>
    </>
  );
}
