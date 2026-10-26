// Run against a local running app: node src/features/invoices/payment-information.browser.mjs
// Optional: VERIXO_TEST_URL and PLAYWRIGHT_CHANNEL. Uses an isolated browser context per case.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
const base = process.env.VERIXO_TEST_URL ?? "http://localhost:3100";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined),
});
let pdfs = 0;
try {
  for (const locale of ["en", "fa"])
    for (const identifiers of [
      { card: "۰۰۱۲-٣٤٥٦-۷۸۹۰-۱۲۳۴", account: "" },
      { card: "", account: "۰۰۰١٢٣" },
      { card: "۰۰۱۲-٣٤٥٦-۷۸۹۰-۱۲۳۴", account: "۰۰۰١٢٣" },
    ]) {
      const messages = JSON.parse(
        await readFile(new URL("../../locales/" + locale + ".json", import.meta.url), "utf8"),
      );
      const context = await browser.newContext({
        permissions: ["clipboard-read", "clipboard-write"],
        hasTouch: true,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const prefix = base + (locale === "en" ? "/en" : "");
      await page.goto(prefix + "/settings?tab=invoices");
      await page
        .getByLabel(messages.settings.accountHolder, { exact: true })
        .fill("Snapshot Holder");
      await page.getByLabel(messages.settings.cardNumber, { exact: true }).fill(identifiers.card);
      await page
        .getByLabel(messages.settings.accountNumber, { exact: true })
        .fill(identifiers.account);
      await page.getByRole("button", { name: messages.settings.save, exact: true }).click();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("verixo:settings:v2:invoices") ?? "null")?.state.value
            .paymentInformation.accountHolder === "Snapshot Holder",
      );
      await page.goto(prefix + "/invoices");
      await page
        .getByRole("button", {
          name: messages.invoices.viewInvoice.replace("{number}", "INV-1042"),
          exact: true,
        })
        .click();
      assert.equal(await page.getByText("Snapshot Holder", { exact: true }).count(), 0);
      await page
        .getByRole("button", { name: messages.invoices.addPaymentDetails, exact: true })
        .click();
      await page.getByText("Snapshot Holder", { exact: true }).waitFor();
      const snapshot = await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("verixo:orders:v2:demo-order-0")).state.value.invoice
            .settingsSnapshot.paymentInformation,
      );
      assert.equal(snapshot.accountNumber, identifiers.account ? "000123" : "");
      assert.equal(snapshot.cardNumber, identifiers.card ? "0012345678901234" : "");
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: messages.invoices.edit, exact: true }).click();
      await page.getByRole("slider", { name: messages.orders.discount }).press("Home");
      for (let step = 0; step < 12; step++)
        await page.getByRole("slider", { name: messages.orders.discount }).press("ArrowUp");
      await dialog.getByRole("switch", { name: messages.invoices.showPaymentDetails }).uncheck();
      await dialog.getByRole("button", { name: messages.invoices.save, exact: true }).click();
      await page.getByText(messages.invoices.paymentSnapshotDisabled, { exact: true }).waitFor();
      const amended = await page.evaluate(
        () => JSON.parse(localStorage.getItem("verixo:orders:v2:demo-order-0")).state.value,
      );
      assert.equal(amended.discountPercentage, 12);
      assert.equal(amended.invoice.discountPercentage, 12);
      assert.equal(amended.invoice.showPaymentDetails, false);
      assert.equal(amended.lines[0].unitPrice, 620000);
      await page.goto(prefix + "/invoice/mock-invoice-demo-order-0");
      await page.getByRole("article").waitFor();
      assert.equal(await page.getByText("Snapshot Holder", { exact: true }).count(), 0);
      await page.getByRole("button", { name: messages.invoices.copyText, exact: true }).click();
      const hiddenText = await page.evaluate(() => navigator.clipboard.readText());
      assert.ok(!hiddenText.includes("Snapshot Holder"));
      const number = new Intl.NumberFormat(locale);
      assert.ok(hiddenText.includes(number.format(-142800)));
      assert.ok(hiddenText.includes(number.format(1107200)));
      const hiddenPdf = await page.pdf({ preferCSSPageSize: true });
      assert.equal(hiddenPdf.subarray(0, 5).toString(), "%PDF-");
      pdfs++;
      await page.goto(prefix + "/invoices");
      await page
        .getByRole("button", {
          name: messages.invoices.viewInvoice.replace("{number}", "INV-1042"),
          exact: true,
        })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: messages.invoices.edit, exact: true })
        .click();
      await page.getByRole("switch", { name: messages.invoices.showPaymentDetails }).check();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: messages.invoices.save, exact: true })
        .click();
      await page.getByText("Snapshot Holder", { exact: true }).waitFor();
      // Changing global settings must not alter the now-persisted invoice.
      await page.evaluate(() => {
        const key = "verixo:settings:v2:invoices";
        const record = JSON.parse(localStorage.getItem(key));
        record.state.value.paymentInformation.accountHolder = "Changed settings";
        localStorage.setItem(key, JSON.stringify(record));
      });
      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(prefix + "/invoice/mock-invoice-demo-order-0");
        await page.getByText("Snapshot Holder", { exact: true }).waitFor();
        assert.equal(await page.getByText("Changed settings", { exact: true }).count(), 0);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
      }
      await page.getByRole("button", { name: messages.invoices.copyText, exact: true }).click();
      const text = await page.evaluate(() => navigator.clipboard.readText());
      assert.ok(text.includes("Snapshot Holder"));
      if (snapshot.cardNumber) assert.ok(text.includes(snapshot.cardNumber));
      if (snapshot.accountNumber) assert.ok(text.includes(snapshot.accountNumber));
      await page.emulateMedia({ media: "print" });
      assert.equal(await page.getByText("Snapshot Holder", { exact: true }).isVisible(), true);
      // Exercise Chromium's same print-to-PDF pipeline used by Save as PDF.
      const pdf = await page.pdf({ preferCSSPageSize: true });
      assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
      assert.ok(pdf.length > 1000);
      pdfs++;
      await page.emulateMedia({ media: "screen" });
      await page.setViewportSize({ width: 375, height: 1000 });
      await page.goto(prefix + "/orders/create");
      await page.locator("#order-discount").waitFor();
      assert.equal(
        await page
          .getByRole("slider", { name: messages.orders.discount })
          .getAttribute("aria-valuenow"),
        "0",
      );
      await page.getByRole("button", { name: messages.orders.addProduct, exact: true }).click();
      await page
        .getByRole("button", { name: new RegExp(messages.orders.simple + "$") })
        .first()
        .click();
      // Check mobile touch in both themes; reset before the existing 10% submission.
      for (const theme of ["light", "dark"]) {
        await page.evaluate((theme) => {
          document.documentElement.classList.toggle("dark", theme === "dark");
          document.documentElement.classList.toggle("light", theme === "light");
        }, theme);
        const control = page.locator("#order-discount > div").first();
        await control.scrollIntoViewIfNeeded();
        const box = await control.boundingBox();
        assert.ok(box);
        assert.ok(box.height >= 44);
        await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height / 2);
        const touched = Number(
          await page
            .getByRole("slider", { name: messages.orders.discount })
            .getAttribute("aria-valuenow"),
        );
        assert.ok(touched > 0 && touched < 100 && Number.isInteger(touched));
        await page.getByRole("slider", { name: messages.orders.discount }).press("Home");
      }
      await page.getByRole("slider", { name: messages.orders.discount }).press("PageUp");
      await page.locator("#order-shipping").fill("100");
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await page.getByRole("button", { name: messages.orders.save, exact: true }).click();
      await page.waitForURL(prefix + "/orders");
      const created = await page.evaluate(() =>
        Object.keys(localStorage)
          .filter((key) => key.startsWith("verixo:orders:v2:"))
          .map((key) => JSON.parse(localStorage.getItem(key)).state.value)
          .find((order) => !order.id.startsWith("demo-order")),
      );
      assert.equal(created.discountPercentage, 10);
      assert.equal(created.invoice.discountPercentage, 10);
      assert.equal(created.invoice.showPaymentDetails, true);
      assert.equal(
        created.invoice.settingsSnapshot.paymentInformation.accountHolder,
        "Changed settings",
      );
      await page.goto(prefix + "/invoice/" + created.invoice.publicToken);
      await page.getByText("Changed settings", { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      await context.close();
    }
  console.log(
    "Passed: 6 Settings → invoice visibility/discount edits → dashboard/public/text/PDF cases; 24 responsive checks including new order creation; " +
      pdfs +
      " generated PDFs.",
  );
} finally {
  await browser.close();
}
