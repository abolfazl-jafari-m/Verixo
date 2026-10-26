// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ProductForm } from "./product-form";
import en from "@/locales/en.json";
vi.mock("@/lib/i18n/navigations", () => ({ Link: () => null }));
afterEach(cleanup);
it("keeps edits after a failed save, prevents duplicate pending submissions, and supports retry", async () => {
  let reject!: (reason: Error) => void;
  const save = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        }),
    )
    .mockResolvedValueOnce(undefined);
  const { container } = render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ProductForm onSave={save} onCancel={() => {}} />
    </NextIntlClientProvider>,
  );
  const name = screen.getByRole("textbox", { name: en.products.name }) as HTMLInputElement;
  fireEvent.change(name, { target: { value: "Retained product" } });
  fireEvent.click(screen.getByRole("button", { name: en.products.save }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  const pending = screen.getByRole("button", { name: en.products.saving });
  expect(pending.hasAttribute("disabled")).toBe(true);
  expect(container.querySelector("form")?.getAttribute("aria-busy")).toBe("true");
  fireEvent.click(pending);
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("save")));
  expect(await screen.findByText(en.products.saveError)).toBeTruthy();
  expect(name.value).toBe("Retained product");
  expect(container.querySelector("form")?.getAttribute("aria-busy")).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: en.products.save }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.queryByText(en.products.saveError)).toBeNull());
});
