import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function NeedActionCard() {
  const t = useTranslations("dashboard.actions");

  return (
    <Card className="border-primary-200/70 bg-linear-to-bl from-card via-card to-primary-50/70 shadow-primary-950/5 dark:border-primary-400/20 dark:to-primary-950/20">
      <CardHeader className={"flex items-center justify-between"}>
        <CardTitle className={"text-primary-800 dark:text-primary-200 flex items-center gap-2"}>
          <div className={"bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-200 rounded-full p-1.5"}>
            <ClipboardList className={"size-3"} />
          </div>
          <h4 className={"text-xs font-semibold"}>{t("sendInvoice")}</h4>
        </CardTitle>
        <div className={"flex flex-col items-center gap-1 text-[10px]"}>
          <span>#۴۵۸۲</span>
          <div className={"flex items-center gap-1"}>
            <Clock className={"size-3"} />
            <span>{t("minutesAgo")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className={"text-sm font-semibold"}>سارا محمدی</h4>
        <p className={"text-muted-foreground text-xs"}>{t("invoiceNotSent")}</p>
      </CardContent>
      <Separator />
      <CardFooter className={"flex items-center justify-between"}>
        <p className={"text-sm font-semibold"}>
          ۳,۴۰۰,۰۰۰ <span className={"font-light"}>{t("currency")}</span>
        </p>
        <Button
          variant={"default"}
          className={
            "bg-primary-600 hover:bg-primary-700 text-primary-foreground flex items-center justify-center gap-1 text-xs shadow-sm"
          }
        >
          <Send className={"size-3"} />
          {t("sendInvoice")}
        </Button>
      </CardFooter>
    </Card>
  );
}
