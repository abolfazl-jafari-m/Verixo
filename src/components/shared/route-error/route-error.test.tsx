// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { NextIntlClientProvider } from "next-intl";
import { RouteError } from "./route-error";
import en from "@/locales/en.json";
import fa from "@/locales/fa.json";
vi.mock("@/lib/i18n/navigations", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));
afterEach(cleanup);
it.each(["en", "fa"] as const)(
  "offers boundary reset without exposing the exception (%s)",
  (locale) => {
    const messages = locale === "fa" ? fa : en,
      reset = vi.fn();
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <RouteError error={new Error("private internal details")} reset={reset} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByText("private internal details")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: messages.appStates.retry }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: messages.appStates.home }).getAttribute("href")).toBe(
      "/",
    );
  },
);
