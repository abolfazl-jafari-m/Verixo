import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/lib/i18n/navigations";
import { ChevronLeft } from "lucide-react";
import { SidebarStats } from "./types";
import { menu } from "./menu-items";

export function SidebarNavigation() {
  const stats: SidebarStats = {
    orders: 100,
    products: 25,
    customers: 1000,
  };
  return (
    <>
      {menu.map((item, index) => (
        <SidebarGroup key={index}>
          <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={"space-y-2"}>
              {item.items?.map((nav, i) => {
                const Icon = nav.icon;
                return (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton size={"sm"} className={"h-fit rounded-md px-2 py-1"}>
                      <Link
                        href={nav.url}
                        className={"flex w-full items-center justify-between gap-2"}
                      >
                        <div className={"flex items-center gap-2"}>
                          <div className={"bg-foreground/20 rounded-lg p-2"}>
                            <Icon />
                          </div>
                          <div className={"flex flex-col"}>
                            <p className={"text-sm font-semibold"}>{nav.title}</p>
                            <span className={"text-xs font-light"}>
                              {nav.getDescription?.(stats)}
                            </span>
                          </div>
                        </div>
                        <ChevronLeft />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
