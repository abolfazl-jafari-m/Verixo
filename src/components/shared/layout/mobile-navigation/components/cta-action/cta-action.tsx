"use client";
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CtaOptions } from "./cta-option";
import { Link, usePathname } from "@/lib/i18n/navigations";
import { useTranslations } from "next-intl";
export function CtaAction() {
  const t = useTranslations("appStates");
  const nav = useTranslations("layout.mobileNavigation");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState(pathname);
  if (previousPath !== pathname) {
    setPreviousPath(pathname);
    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger
        render={
          <Button
            aria-label={nav("quickActions")}
            className="bg-primary text-primary-foreground absolute top-1/2 left-1/2 z-10 size-11 -translate-x-1/2 -translate-y-1/2 rounded-xl"
          >
            <Plus aria-hidden="true" />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerTitle className="sr-only">{nav("quickActions")}</DrawerTitle>
        <div className="space-y-3 p-4">
          {CtaOptions.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              onNavigate={() => {
                if (pathname === item.url) setOpen(false);
              }}
              className="bg-muted/40 hover:bg-muted focus-visible:ring-ring flex items-center gap-3 rounded-xl p-4 outline-none focus-visible:ring-2"
            >
              <item.icon className="text-primary size-5" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{t(item.title)}</span>
                <span className="text-muted-foreground text-xs">{t(item.description)}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Link>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">{t("cancel")}</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
