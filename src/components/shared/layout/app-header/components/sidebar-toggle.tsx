"use client";
import { Button } from "@/components/ui/button";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarToggle({ className, ...props }: ButtonPrimitive.Props) {
  const t = useTranslations("appStates");
  const { toggleSidebar, isMobile, openMobile, open } = useSidebar();
  return (
    <Button
      aria-label={t("toggleNavigation")}
      aria-expanded={isMobile ? openMobile : open}
      variant="outline"
      size="icon"
      className={cn("hover:bg-muted rounded-xl p-2", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <Menu className="size-4" />
    </Button>
  );
}
