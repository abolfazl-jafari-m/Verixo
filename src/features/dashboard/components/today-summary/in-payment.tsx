import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

export function InPayment() {
  const t = useTranslations("dashboard.todaySummary");

  return (
    <div className={"border-secondary-800 bg-secondary-500/30 space-y-2 rounded-lg border p-2"}>
      <div
        className={"text-secondary-800 dark:text-secondary-500 flex items-center justify-between"}
      >
        <CreditCard className={"text-secondary-800 dark:text-secondary-500 size-4"} />
        <p className={"font-bold"}>8</p>
      </div>

      <div className={"space-y-1"}>
        <p className={"text-xs"}>{t("paymentConfirmation")}</p>
        <div
          className={"text-warning-600 dark:text-warning-500 flex items-center gap-1 text-[10px]"}
        >
          <p>{t("pending")}</p>
        </div>
      </div>
    </div>
  );
}
