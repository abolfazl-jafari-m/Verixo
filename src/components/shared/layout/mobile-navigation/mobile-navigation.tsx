import { CtaAction, MobileNavigationLink } from "./components";
import { mobileItems } from "./navigation-items";
import { useTranslations } from "next-intl";

function MobileNavigation() {
  const t = useTranslations("layout.mobileNavigation");

  return (
    <nav
      aria-label={t("label")}
      className="bg-background/95 border-border/60 shadow-foreground/10 fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-2xl border p-2 shadow-lg backdrop-blur-xl md:hidden"
    >
      <div className="relative grid grid-cols-5 items-center gap-1">
        {mobileItems.map((item, i) =>
          item.type === "link" ? (
            <MobileNavigationLink href={item.href} key={i}>
              <item.icon className="size-5" aria-hidden="true" />
              <span className="text-[11px] leading-4 text-nowrap">{t(item.titleKey)}</span>
            </MobileNavigationLink>
          ) : (
            <div className="h-14" key={item.type} />
          ),
        )}
        <CtaAction />
      </div>
    </nav>
  );
}

export default MobileNavigation;
