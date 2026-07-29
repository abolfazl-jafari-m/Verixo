import { MobileNavSvg, CtaAction, MobileNavigationLink } from "./components";
import { mobileItems } from "./navigation-items";

function MobileNavigation() {
  return (
    <div className={"fixed bottom-0 z-50 w-full md:hidden"}>
      <MobileNavSvg />
      <CtaAction />

      <div className={"absolute inset-0 flex items-center justify-between gap-4 px-6"}>
        {mobileItems.map((item, i) =>
          item.type === "link" ? (
            <MobileNavigationLink href={item.href} key={i}>
              <item.icon className={"w-5"} />
              <p className={"text-xs text-nowrap"}>{item.title}</p>
            </MobileNavigationLink>
          ) : (
            <div className={"w-14"} key={item.type} />
          ),
        )}
      </div>
    </div>
  );
}

export default MobileNavigation;
