import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function WelcomeMessage({ className, ...props }: ComponentProps<"div">) {
  const t = useTranslations("layout");

  return (
    <div className={cn("flex flex-col leading-tight", className)} {...props}>
      <span className="text-muted-foreground text-xs">{t("greeting")}</span>
      <span className="text-sm font-semibold">{t("userName")}</span>
    </div>
  );
}
