import React, { ComponentProps } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  SidebarBrand,
  SidebarNavigation,
  SidebarUserAction,
} from "@/components/shared/layout/app-sidebar/components";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/i18n/navigations";

import { Plus } from "lucide-react";

function AppSidebar({
  className,
  variant,
  collapsible,
  side,
  ...props
}: ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  return (
    <Sidebar
      variant={variant}
      collapsible={collapsible}
      side={side}
      className={cn(className)}
      {...props}
    >
      <SidebarHeader className={"flex flex-col gap-4 p-4"}>
        <SidebarBrand />
        <Link
          href={"/orders"}
          className={
            "bg-primary-600 dark:bg-primary-800 shadow-primary-900 flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-white shadow-[0_4px_4px]"
          }
        >
          <p className={"text-sm"}>ثبت سفارش</p>
          <Plus size={12} />
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>
      <Separator />
      <SidebarFooter className={"p-2"}>
        <SidebarUserAction />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
