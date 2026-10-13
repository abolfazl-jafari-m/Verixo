// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/locales/en.json";
import { ShopSettings } from "./components/business-settings/business-settings";
import { defaultSettings } from "./model";
import { readSettingsSection, saveSettingsSection } from "./storage";
import { toast } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/i18n/navigations", () => ({ useRouter: () => ({ push: vi.fn() }), Link: "a" }));
vi.mock("@/components/ui/toast", () => ({ toast: { add: vi.fn() } }));
beforeEach(() => {
  const records = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      records.set(key, value);
    },
  });
  vi.mocked(toast.add).mockClear();
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});
function renderShop() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="Asia/Tehran">
      <ShopSettings />
    </NextIntlClientProvider>,
  );
}
describe("settings editing", () => {
  it("retains failed edits, shows no success, and succeeds on retry", async () => {
    const user = userEvent.setup();
    renderShop();
    const name = await screen.findByLabelText("Shop name — English");
    await user.clear(name);
    await user.type(name, "Saved after retry");
    const set = vi.spyOn(localStorage, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText(messages.settings.saveError);
    expect(toast.add).not.toHaveBeenCalled();
    expect(readSettingsSection("shop").value.name.en).toBe(defaultSettings.shop.name.en);
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(readSettingsSection("shop").value.name.en).toBe("Saved after retry"),
    );
    expect(toast.add).toHaveBeenCalledTimes(1);
    set.mockRestore();
  });
  it("restores unsaved drafts after remount and discards back to saved values", async () => {
    const user = userEvent.setup();
    saveSettingsSection("shop", {
      ...defaultSettings.shop,
      name: { fa: "فروشگاه", en: "Saved name" },
    });
    const view = renderShop();
    const name = await screen.findByLabelText("Shop name — English");
    await user.clear(name);
    await user.type(name, "Draft name");
    view.unmount();
    renderShop();
    await waitFor(() =>
      expect((screen.getByLabelText("Shop name — English") as HTMLInputElement).value).toBe(
        "Draft name",
      ),
    );
    expect(readSettingsSection("shop").value.name.en).toBe("Saved name");
    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    expect((screen.getByLabelText("Shop name — English") as HTMLInputElement).value).toBe(
      "Saved name",
    );
  });
});
