import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SalesProgress, SalesTrending, SalesStats } from "./";
import { useTranslations } from "next-intl";

export function SalesOverview() {
  const t = useTranslations("dashboard.salesOverview");

  return (
    <Card className="border-primary-200/70 from-card via-card to-primary-50/60 dark:border-primary-400/15 dark:to-primary-950/20 h-full bg-linear-to-bl shadow-sm">
      <CardHeader>
        <CardTitle className={"max-md:text-sm"}>{t("title")}</CardTitle>
        <CardAction>
          <SalesTrending />
        </CardAction>
      </CardHeader>
      <CardContent className={"flex flex-1 flex-col items-center justify-center gap-4"}>
        <p className={"text-4xl font-semibold"}>22.456.000</p>
        <SalesProgress />
      </CardContent>
      <Separator />
      <CardFooter className={"flex items-center gap-4"}>
        <SalesStats />
      </CardFooter>
    </Card>
  );
}
