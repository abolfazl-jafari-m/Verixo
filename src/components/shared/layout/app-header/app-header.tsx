import React from "react";
import {
  Notifications,
  SidebarToggle,
  TodayDate,
  UserAvatar,
  WelcomeMessage,
  ThemeToggleWrapper as ThemeToggle,
} from "./components";
import Image from "next/image";
import brand from "@/assets/brand.webp";

export function AppHeader() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 flex min-h-16 justify-between border-b px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <SidebarToggle />
        <div className={"flex items-center gap-2"}>
          <UserAvatar />
          <WelcomeMessage />
        </div>
      </div>

      <div
        className={
          "bg-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md px-3 py-1 max-md:hidden"
        }
      >
        <Image src={brand} alt={"verixo"} className="h-auto w-[100px]" />
      </div>

      <div className="flex items-center gap-2">
        <TodayDate />
        <Notifications />
        <ThemeToggle />
      </div>
    </header>
  );
}
