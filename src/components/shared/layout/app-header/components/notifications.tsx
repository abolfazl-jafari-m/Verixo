import { Button } from "@/components/ui/button";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Notifications({ className, ...props }: ButtonPrimitive.Props) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("border-border/70 relative rounded-xl", className)}
      {...props}
    >
      <Bell className="size-4" />
    </Button>
  );
}
