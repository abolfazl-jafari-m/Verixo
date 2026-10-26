// Run against a local production server. Browser data is isolated from the user's profile.
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
const base = process.env.VERIXO_TEST_URL ?? "http://localhost:3100";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined),
});
const screenshots = join(tmpdir(), "verixo-feedback-states");
await mkdir(screenshots, { recursive: true });
let checks = 0;
try {
  for (const locale of ["en", "fa"]) {
    const messages = JSON.parse(
      await readFile(new URL("../../locales/" + locale + ".json", import.meta.url), "utf8"),
    );
    const prefix = locale === "en" ? "/en" : "";
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(base + prefix + "/inventory");
    await page.getByRole("textbox", { name: messages.inventory.search, exact: true }).waitFor();
    await page.evaluate(() => localStorage.setItem("verixo:inventory:v2", "broken record"));
    await page.reload();
    await page.getByRole("alert").filter({ hasText: messages.inventory.loadError }).waitFor();
    assert.equal(await page.getByText(messages.inventory.empty, { exact: true }).count(), 0);
    const search = page.getByRole("textbox", { name: messages.inventory.search, exact: true });
    await search.fill("missing-product-1234");
    await page.screenshot({
      path: join(screenshots, locale + "-inventory-error.png"),
      fullPage: true,
    });
    await page.evaluate(() => localStorage.removeItem("verixo:inventory:v2"));
    await page.getByRole("button", { name: messages.products.retry, exact: true }).click();
    await page.getByRole("heading", { name: messages.inventory.noResults, exact: true }).waitFor();
    assert.equal(await search.inputValue(), "missing-product-1234");
    await page.getByRole("button", { name: messages.products.clearFilters, exact: true }).click();
    assert.equal(await search.inputValue(), "");
    await page
      .getByRole("button", { name: messages.inventory.adjust, exact: false })
      .first()
      .waitFor();
    checks++;
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => localStorage.setItem("theme", theme), theme);
      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of [
          "inventory",
          "products",
          "orders/archive",
          "customers",
          "invoices",
          "reports",
          "orders/create",
          "settings",
          "invoice/missing",
          "order-information/missing",
        ]) {
          await page.goto(base + prefix + "/" + route);
          await page.locator("body").waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'));
          assert.equal(
            await page.locator("body").getAttribute("dir"),
            locale === "fa" ? "rtl" : "ltr",
          );
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            true,
            locale + " " + theme + " " + width + " " + route + " overflow",
          );
          if (width === 375 && ["inventory", "invoice/missing", "orders/archive"].includes(route))
            await page.screenshot({
              path: join(
                screenshots,
                locale + "-" + theme + "-" + route.replaceAll("/", "-") + ".png",
              ),
              fullPage: true,
            });
          checks++;
        }
      }
    }
    await context.close();
  }
  // Disable hydration to inspect the actual server-rendered loading layouts.
  for (const locale of ["en", "fa"]) {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "products",
        "orders",
        "orders/create",
        "settings",
        "invoice/missing",
        "reports",
        "dashboard",
      ]) {
        await page.goto(base + (locale === "en" ? "/en" : "") + "/" + route);
        await page.locator('[data-slot="skeleton"]').first().waitFor();
        for (const theme of ["light", "dark"]) {
          await page.evaluate(
            (theme) => document.documentElement.classList.toggle("dark", theme === "dark"),
            theme,
          );
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            true,
            route + " skeleton overflow",
          );
          assert.equal(
            await page
              .locator('[data-slot="skeleton"]')
              .first()
              .evaluate((el) => getComputedStyle(el).animationName),
            "none",
          );
          if (width === 375 && ["orders/create", "invoice/missing"].includes(route))
            await page.screenshot({
              path: join(
                screenshots,
                locale + "-" + theme + "-skeleton-" + route.replaceAll("/", "-") + ".png",
              ),
              fullPage: true,
            });
          checks++;
        }
      }
    }
    await context.close();
  }
  console.log("Passed " + checks + " browser state/layout checks; screenshots: " + screenshots);
} finally {
  await browser.close();
}
