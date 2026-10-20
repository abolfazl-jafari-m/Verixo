"use client";

import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useSettingsSection } from "@/features/settings/use-settings";

export function WelcomeMessage({ className, ...props }: ComponentProps<"div">) {
  const t = useTranslations("layout");
  const locale = useLocale();
  const { value: shop } = useSettingsSection("shop");
  const name = shop.name[locale === "fa" ? "fa" : "en"];

  return (
    <div className={cn("flex flex-col leading-tight", className)} {...props}>
      <span className="text-muted-foreground text-xs">{t("greeting")}</span>
      <span className="text-sm font-semibold">{name}</span>
    </div>
  );
}
