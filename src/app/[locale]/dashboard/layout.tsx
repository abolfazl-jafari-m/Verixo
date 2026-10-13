import React from "react";
import { AppHeader } from "@/components/shared/layout/app-header";
import MobileNavigation from "@/components/shared/layout/mobile-navigation/mobile-navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/shared/layout/app-sidebar/app-sidebar";
import { useLocale } from "next-intl";

function Layout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  return (
    <div>
      <SidebarProvider className={"has-data-[variant=inset]:bg-sidebar/20"}>
        <AppSidebar variant={"inset"} side={locale === "fa" ? "right" : "left"} />
        <SidebarInset className={"overflow-hidden"}>
          <AppHeader />
          {children}
          <MobileNavigation />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default Layout;
