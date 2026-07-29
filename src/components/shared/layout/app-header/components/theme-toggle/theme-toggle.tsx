"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import React from "react";
import type { BaseUIEvent } from "@base-ui/react";

export function ThemeToggle({ className, onClick, ...props }: ButtonPrimitive.Props) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (
    e: BaseUIEvent<React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>>,
  ) => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    onClick?.(e);
  };
  return (
    <>
      <Button
        variant="default"
        size="icon"
        onClick={handleThemeChange}
        className={cn(
          "border-border/70 rounded-xl transition-all duration-200 ease-in",
          theme === "light" ? "bg-neutral-950" : "bg-yellow-600",
          className,
        )}
        {...props}
      >
        {theme === "light" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className={"size-4 text-yellow-950"} />
        )}
      </Button>
    </>
  );
}
