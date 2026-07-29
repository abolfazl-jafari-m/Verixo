import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AvatarRoot } from "@base-ui/react";

export function UserAvatar({ className, ...props }: AvatarRoot.Props) {
  return (
    <Avatar className={cn("border-primary/20 size-10 border-2", className)} {...props}>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">VX</AvatarFallback>
    </Avatar>
  );
}
