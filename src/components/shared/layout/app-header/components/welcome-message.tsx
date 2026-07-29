import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function WelcomeMessage({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col leading-tight", className)} {...props}>
      <span className="text-muted-foreground text-xs">سلام 👋</span>
      <span className="text-sm font-semibold">سینا رضایی</span>
    </div>
  );
}
