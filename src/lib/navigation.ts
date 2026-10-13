// next-intl usePathname removes the locale prefix.
export function isNavigationActive(
  pathname: string,
  destination: string,
  match: "exact" | "section" = "section",
) {
  const path = pathname.replace(/\/$/, "") || "/";
  const target = destination.replace(/\/$/, "") || "/";
  return (
    path === target ||
    (match === "section" &&
      target !== "/" &&
      target !== "/dashboard" &&
      path.startsWith(target + "/"))
  );
}
