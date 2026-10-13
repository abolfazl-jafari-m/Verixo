"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/lib/i18n/navigations";
import { isNavigationActive } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";
import { menu } from "./menu-items";
import { useTranslations } from "next-intl";
export function SidebarNavigation() {
  const t = useTranslations("layout.navigation");
  const states = useTranslations("appStates");
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <nav aria-label={states("navigation")}>
      {menu.map((group) => (
        <SidebarGroup key={group.titleKey}>
          <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {group.items?.map((item) => {
                const active = !item.disabled && isNavigationActive(pathname, item.url, item.match);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={
                        item.disabled ? undefined : (
                          <Link
                            href={item.url}
                            onNavigate={() => {
                              if (pathname === item.url) setOpenMobile(false);
                            }}
                            aria-current={active ? "page" : undefined}
                          />
                        )
                      }
                      disabled={item.disabled}
                      isActive={active}
                      className="h-12 rounded-xl px-3 motion-reduce:transition-none"
                    >
                      <item.icon aria-hidden="true" />
                      <span className="flex-1 text-start text-sm">{t(item.title)}</span>
                      {item.disabled ? (
                        <span className="text-[10px]">{states("soon")}</span>
                      ) : (
                        <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}
