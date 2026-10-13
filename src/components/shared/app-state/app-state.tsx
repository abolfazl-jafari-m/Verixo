import type { ReactNode } from "react";
import { CircleAlert, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
export function AppState({
  title,
  description,
  action,
  kind = "empty",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  kind?: "empty" | "error";
  className?: string;
}) {
  const Icon = kind === "error" ? CircleAlert : Inbox;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "bg-card border-border/50 flex flex-col items-center gap-3 rounded-2xl border px-5 py-12 text-center",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-6", kind === "error" ? "text-destructive" : "text-muted-foreground")}
      />
      <h2 className="text-base font-semibold">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-md text-sm leading-6">{description}</p>
      )}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
