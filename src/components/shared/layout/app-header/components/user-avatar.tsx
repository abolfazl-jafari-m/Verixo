"use client";
import React from "react";
import { useLocale } from "next-intl";
import { useSettingsSection } from "@/features/settings/use-settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AvatarRoot } from "@base-ui/react";

export function UserAvatar({ className, ...props }: AvatarRoot.Props) {
  const locale = useLocale();
  const { value: shop } = useSettingsSection("shop");
  const name = shop.name[locale === "fa" ? "fa" : "en"];
  return (
    <Avatar className={cn("border-primary/20 size-10 border-2", className)} {...props}>
      <AvatarImage src={shop.logo || undefined} alt={name} className="object-cover" />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold" aria-label={name}>
        {name.trim().slice(0, 2).toLocaleUpperCase(locale)}
      </AvatarFallback>
    </Avatar>
  );
}
