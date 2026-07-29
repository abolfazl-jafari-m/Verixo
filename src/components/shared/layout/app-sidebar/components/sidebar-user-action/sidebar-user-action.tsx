import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export function SidebarUserAction() {
  return (
    <div className={"flex flex-col gap-2"}>
      <Button
        variant={"destructive"}
        className={
          "bg-danger-50 border-danger-600 text-danger-700 h-fit rounded-md border py-1.5 dark:text-white"
        }
      >
        <LogOutIcon />
        خروج از حساب کاربری
      </Button>
    </div>
  );
}
