// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { InventoryAlert } from "./inventory-alert";
import { InventoryWorkspace } from "../inventory-workspace/inventory-workspace";
import { productService } from "@/features/products/services/product-service";
import type { Product } from "@/features/products/types";
import en from "@/locales/en.json";
import fa from "@/locales/fa.json";
vi.mock("@/lib/i18n/navigations", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function mount(locale: "en" | "fa", workspace = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "fa" ? fa : en}>
      <QueryClientProvider client={client}>
        {workspace ? <InventoryWorkspace /> : <InventoryAlert />}
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}
it.each(["en", "fa"] as const)(
  "shows loading, then an error, and recovers through the query retry (%s)",
  async (locale) => {
    let reject!: (reason: Error) => void;
    let resolve!: (products: Product[]) => void;
    const list = vi
      .spyOn(productService, "list")
      .mockImplementationOnce(
        () =>
          new Promise((_, fail) => {
            reject = fail;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
    const messages = locale === "fa" ? fa : en;
    mount(locale);
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    await act(async () => reject(new Error("storage")));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining(messages.inventory.loadError),
    );
    expect(screen.queryByText(messages.inventory.empty)).toBeNull();
    const retry = screen.getByRole("button", { name: messages.appStates.retry });
    fireEvent.click(retry);
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true"));
    expect(screen.queryByRole("button", { name: messages.appStates.retry })).toBeNull();
    await act(async () => resolve([]));
    expect(await screen.findByText(messages.inventory.empty)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  },
);
it("retains inventory filters through failure and retries without treating failure as empty data", async () => {
  let reject!: (reason: Error) => void;
  vi.spyOn(productService, "list")
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        }),
    )
    .mockResolvedValueOnce([]);
  mount("en", true);
  const search = screen.getByRole("textbox", { name: en.inventory.search }) as HTMLInputElement;
  fireEvent.change(search, { target: { value: "saved search" } });
  await act(async () => reject(new Error("storage")));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(search.value).toBe("saved search");
  expect(screen.queryByText(en.inventory.empty)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: en.products.retry }));
  expect(await screen.findByText(en.inventory.empty)).toBeTruthy();
  expect(search.value).toBe("saved search");
  expect(screen.getByRole("link", { name: en.products.create }).getAttribute("href")).toBe(
    "/products/create",
  );
});
