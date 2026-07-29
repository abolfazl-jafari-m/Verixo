"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  PlanBadge,
  BrandAvatar,
  BrandStatus,
} from "@/components/shared/layout/app-sidebar/components/sidebar-brand/components";

export function SidebarBrand() {
  const { setOpenMobile } = useSidebar();
  return (
    <div className={"flex flex-col gap-6"}>
      <div className={"flex items-center justify-between"}>
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => setOpenMobile(false)}
          className={"md:hidden"}
        >
          <X size={24} />
        </Button>
        <PlanBadge />
      </div>
      <BrandAvatar />
      <BrandStatus />
    </div>
  );
}
