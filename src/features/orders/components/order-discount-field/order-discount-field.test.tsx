// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NextIntlClientProvider } from "next-intl";
import { OrderDiscountField } from "./order-discount-field";
import { discountPercentageSchema } from "../../schemas/discount-schema";
import { orderTotals } from "../../totals";
import en from "@/locales/en.json";
import fa from "@/locales/fa.json";
const schema = z.object({ discountPercentage: discountPercentageSchema });
function Harness({
  initial = 0,
  onSubmit = () => {},
}: {
  initial?: number;
  onSubmit?: (value: z.infer<typeof schema>) => void;
}) {
  const form = useForm({
    defaultValues: { discountPercentage: initial },
    resolver: zodResolver(schema),
  });
  const percentage = useWatch({ control: form.control, name: "discountPercentage" });
  const totals = orderTotals(
    [{ productId: "p", name: "Product", unitPrice: 2000, quantity: 1 }],
    100,
    percentage,
  );
  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="discountPercentage"
        render={({ field, fieldState }) => (
          <OrderDiscountField
            id="discount"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            invalid={!!fieldState.error}
            discountAmount={totals.discountAmount}
          />
        )}
      />
      <p data-testid="state">{percentage}</p>
      <p data-testid="amount">{totals.discountAmount}</p>
      <p data-testid="total">{totals.total}</p>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
      <button type="button" onClick={() => form.setValue("discountPercentage", 101)}>
        Invalid
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
// Base UI measures edge-aligned thumbs; jsdom has no layout engine.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    return new DOMRect(0, 0, this.dataset.slot === "slider-thumb" ? 20 : 320, 44);
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it.each(["en", "fa"] as const)(
  "updates RHF and totals with keyboard input, then restores saved state on reset (%s)",
  async (locale) => {
    const messages = locale === "fa" ? fa : en;
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Harness initial={15} />
      </NextIntlClientProvider>,
    );
    const slider = await screen.findByRole("slider", { name: messages.orders.discount });
    expect(slider.getAttribute("aria-valuenow")).toBe("15");
    fireEvent.keyDown(slider, { key: locale === "fa" ? "ArrowLeft" : "ArrowRight" });
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("16"));
    expect(screen.getByTestId("amount").textContent).toBe("320");
    expect(screen.getByTestId("total").textContent).toBe("1780");
    fireEvent.click(screen.getByText("Reset"));
    await waitFor(() => expect(slider.getAttribute("aria-valuenow")).toBe("15"));
    expect(screen.getByTestId("total").textContent).toBe("1800");
  },
);
it("defaults to zero, submits the changed percentage and preserves validation", async () => {
  const submissions: number[] = [];
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Harness onSubmit={(value) => submissions.push(value.discountPercentage)} />
    </NextIntlClientProvider>,
  );
  const slider = await screen.findByRole("slider", { name: "Discount" });
  expect(slider.getAttribute("aria-valuenow")).toBe("0");
  expect(slider.getAttribute("step")).toBe("1");
  fireEvent.change(slider, { target: { value: "25" } });
  expect(screen.getByTestId("total").textContent).toBe("1600");
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() => expect(submissions).toEqual([25]));
  fireEvent.click(screen.getByText("Invalid"));
  fireEvent.click(screen.getByText("Submit"));
  await screen.findByRole("alert");
  expect(submissions).toEqual([25]);
  expect(document.activeElement).toBe(slider);
  fireEvent.click(screen.getByText("Reset"));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  expect(screen.getByTestId("state").textContent).toBe("0");
});
it("does not round an existing decimal discount until the seller moves the slider", async () => {
  const submissions: number[] = [];
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Harness initial={12.5} onSubmit={(value) => submissions.push(value.discountPercentage)} />
    </NextIntlClientProvider>,
  );
  expect(
    (await screen.findByRole("slider", { name: "Discount" })).getAttribute("aria-valuenow"),
  ).toBe("12.5");
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() => expect(submissions).toEqual([12.5]));
});
