"use client";
import { Button } from "@/components/ui/button";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Menu } from "lucide-react";
import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarToggle({ className, ...props }: ButtonPrimitive.Props) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
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
