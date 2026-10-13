"use client";
import { ThemeProvider, ThemeProviderProps } from "next-themes";
import React from "react";

function AppThemeProvider({
  children,
  ...props
}: { children: React.ReactNode } & ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem {...props}>
      {children}
    </ThemeProvider>
  );
}

export default AppThemeProvider;
