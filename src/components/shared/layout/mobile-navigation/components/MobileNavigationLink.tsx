"use client";

import { Link, usePathname } from "@/lib/i18n/navigations";
import { isNavigationActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type MobileNavigationLinkProps = ComponentProps<typeof Link>;
export function MobileNavigationLink({
  href,
  className,
  children,
  ...props
}: MobileNavigationLinkProps) {
  const pathname = usePathname();

  const target = typeof href === "string" ? href : href.pathname;
  const isActive = Boolean(target && isNavigationActive(pathname, target));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none",
        isActive
          ? "bg-primary/10 text-primary font-semibold [&>svg]:stroke-[2.25]"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
