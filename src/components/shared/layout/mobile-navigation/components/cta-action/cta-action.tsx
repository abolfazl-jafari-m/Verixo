import { ChevronLeft, Plus } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CtaOptions } from "@/components/shared/layout/mobile-navigation/components/cta-action/cta-option";
import { Link } from "@/lib/i18n/navigations";
import { cn } from "@/lib/utils";

export function CtaAction() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={
          <Button className="from-primary-700 to-primary-950 absolute top-0 left-1/2 z-50 flex size-13 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-linear-to-br shadow-[0_4px_30px_var(--primary)/0.85]">
            <Plus size={24} color={"white"} />
          </Button>
        }
      />
      <DrawerContent>
        <div className={"flex flex-col gap-4 p-4"}>
          {CtaOptions.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.url}
                key={i}
                className={cn(
                  "flex items-center justify-between rounded-md border bg-linear-120 p-4 shadow-md",
                  item.className,
                )}
              >
                <div className={"flex items-center gap-2"}>
                  <div
                    className={
                      "bg-foreground/20 flex size-10 items-center justify-center rounded-lg"
                    }
                  >
                    <Icon className={"size-5 text-white"} />
                  </div>
                  <div className={"flex flex-col"}>
                    <h6 className={"text-sm font-semibold text-white"}>{item.title}</h6>
                    <p className={"text-xs font-light text-neutral-200"}>{item.description}</p>
                  </div>
                </div>
                <ChevronLeft className={"size-4 text-white"} />
              </Link>
            );
          })}
        </div>
        <DrawerFooter>
          <DrawerClose
            render={
              <Button variant={"outline"} className={"rounded-md"}>
                انصراف
              </Button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
