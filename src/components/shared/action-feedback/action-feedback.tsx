import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
export function ActionFeedback({
  message,
  kind = "success",
}: {
  message: string;
  kind?: "success" | "error";
}) {
  const Icon = kind === "error" ? CircleAlert : CircleCheck;
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl p-3 text-sm leading-6",
        kind === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-foreground",
      )}
    >
      <Icon aria-hidden="true" className="mt-1 size-4 shrink-0" />
      {message}
    </p>
  );
}
