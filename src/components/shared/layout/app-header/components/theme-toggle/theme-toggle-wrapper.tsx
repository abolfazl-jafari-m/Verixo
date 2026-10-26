"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
const ThemeToggle = dynamic(() => import("./theme-toggle").then((mod) => mod.ThemeToggle), {
  ssr: false,
  loading: () => <Skeleton aria-hidden="true" className="size-9 rounded-full" />,
});
export function ThemeToggleWrapper() {
  return (
    <>
      <ThemeToggle />
    </>
  );
}
