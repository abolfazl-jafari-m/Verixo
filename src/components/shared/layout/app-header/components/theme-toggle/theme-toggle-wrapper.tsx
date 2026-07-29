"use client";
import dynamic from "next/dynamic";
import { PuffLoader } from "react-spinners";
const ThemeToggle = dynamic(() => import("./theme-toggle").then((mod) => mod.ThemeToggle), {
  ssr: false,
  loading: (loadingProps) => (
    <PuffLoader size={24} color={"#4f39f6"} loading={loadingProps.isLoading} />
  ),
});
export function ThemeToggleWrapper() {
  return (
    <>
      <ThemeToggle />
    </>
  );
}
