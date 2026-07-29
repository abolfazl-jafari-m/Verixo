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
    <header className="sticky top-0 z-40 flex justify-between border-b-2 bg-neutral-300 px-6 py-4 shadow-[0_4px_12px] shadow-neutral-400 backdrop-blur-md dark:bg-neutral-700/70 dark:shadow-neutral-950">
      <div className="flex flex-col gap-4">
        <SidebarToggle />
        <div className={"flex items-center gap-2"}>
          <UserAvatar />
          <WelcomeMessage />
        </div>
      </div>

      <div
        className={
          "absolute left-1/2 -translate-x-1/2 self-start rounded-md bg-white/20 px-3 py-0.5 dark:bg-white/40"
        }
      >
        <Image src={brand.src} alt={"verixo"} width={100} height={70} />
      </div>

      <div className="flex flex-col gap-4">
        <div className={"flex items-center gap-2 self-end"}>
          <Notifications />
          <ThemeToggle />
        </div>
        <TodayDate />
      </div>
    </header>
  );
}
