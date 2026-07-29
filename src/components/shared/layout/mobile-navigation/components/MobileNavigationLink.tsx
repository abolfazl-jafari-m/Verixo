"use client";

import { Link, usePathname } from "@/lib/i18n/navigations";
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

  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href as string);

  return (
    <Link
      href={href}
      className={cn(
        "flex h-12 w-12 flex-col items-center justify-center gap-1 transition-all",
        isActive ? "text-primary-900 scale-100" : "hover:text-primary-900 scale-95 text-white",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
