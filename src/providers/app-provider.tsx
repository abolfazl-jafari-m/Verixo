import React, { ReactNode } from "react";
import IntlProvider from "@/providers/intl-provider";
import AppThemeProvider from "@/providers/app-theme-provider";
import QueryProvider from "@/providers/query-provider";

function AppProvider({ children, locale }: { children: ReactNode; locale: string }) {
  return (
    <AppThemeProvider>
      <QueryProvider>
        <IntlProvider locale={locale}>{children}</IntlProvider>
      </QueryProvider>
    </AppThemeProvider>
  );
}

export default AppProvider;
