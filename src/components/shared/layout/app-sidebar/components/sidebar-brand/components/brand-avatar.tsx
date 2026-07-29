import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import React from "react";
import type { AvatarRoot } from "@base-ui/react";

export function BrandAvatar({ className, ...props }: AvatarRoot.Props) {
  return (
    <div className={"flex items-center gap-2"}>
      <Avatar
        className={cn(
          "border-primary-600 bg-primary-200 dark:bg-primary-700 size-14 rounded-md border-2 after:border-none",
          className,
        )}
        {...props}
      >
        <AvatarFallback className="text-primary-500 size-full rounded-md border-none font-semibold shadow-none ring-0">
          Brand
        </AvatarFallback>
      </Avatar>
      <div className={"flex flex-col"}>
        <h4 className={"font-bold"}>سینا رضایی</h4>
        <h6 className={"text-sm font-light"}>فروشگاه مد پارسی</h6>
      </div>
    </div>
  );
}
