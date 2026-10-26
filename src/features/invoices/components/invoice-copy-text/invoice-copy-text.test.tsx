// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/locales/en.json";
import { mockOrders } from "@/features/orders/data/mock-orders";
import { invoiceFromOrder } from "../../utils";
import { InvoiceCopyText } from "./invoice-copy-text";
const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("@/components/ui/toast", () => ({ toast: { add } }));
vi.mock("@/components/shared", () => ({
  ActionSpinner: () => <span>Loading</span>,
  ActionFeedback: ({ message }: { message: string }) => <p role="alert">{message}</p>,
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function setup() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <InvoiceCopyText invoice={invoiceFromOrder(mockOrders[0])} />
    </NextIntlClientProvider>,
  );
  return screen.getByRole("button", { name: "Copy as Text" }) as HTMLButtonElement;
}
it("copies plain text, disables while pending and reports success", async () => {
  let finish!: () => void;
  const writeText = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  const button = setup();
  fireEvent.click(button);
  expect(button.disabled).toBe(true);
  expect(writeText.mock.calls[0]).toBeDefined();
  finish();
  await waitFor(() => expect(button.disabled).toBe(false));
  expect(add).toHaveBeenCalledWith({ title: messages.invoices.textCopied, type: "success" });
});
it.each([false, true])(
  "reports unavailable/rejected clipboard and allows retry (rejected=%s)",
  async (rejected) => {
    vi.stubGlobal(
      "navigator",
      rejected ? { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } } : {},
    );
    const button = setup();
    fireEvent.click(button);
    await screen.findByRole("alert");
    expect(button.disabled).toBe(false);
    expect(add).not.toHaveBeenCalled();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    fireEvent.click(button);
    await waitFor(() => expect(add).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).toBeNull();
  },
);

vi.mock("@/lib/i18n/navigations", () => ({ getPathname: ({ href }: { href: string }) => href }));
