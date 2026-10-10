import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function SalesTrending() {
  const t = useTranslations("dashboard.salesOverview");

  return (
    <Badge className={"bg-success-500 border-success-900 h-fit"}>
      <TrendingUp />
      <span>{t("growth")}</span>
    </Badge>
  );
}
