"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { orderTotals } from "@/features/orders/utils";
import type { Invoice } from "../../types";
import { invoiceDateOptions, invoiceStatusStyles } from "../../utils";
import styles from "./invoice-document.module.css";

// Shared by seller preview, customer page and browser print. Only the public
// invoice view model is accepted here, never the order's internal notes.
export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const t = useTranslations("invoices");
  const f = useFormatter();
  const locale = useLocale();
  const language = locale === "fa" ? "fa" : "en";
  const settings = invoice.settingsSnapshot;
  const totals = orderTotals(invoice.lines, invoice.shipping);
  return (
    <article
      className={`${styles.document} border-border/50 bg-card space-y-6 rounded-2xl border p-4 sm:p-6`}
      dir={locale === "fa" ? "rtl" : "ltr"}
      aria-label={t("document", { number: invoice.number })}
    >
      <header className="border-border/50 flex flex-wrap justify-between gap-4 border-b pb-5">
        <div className="space-y-2">
          {settings.logo && (
            <Image
              unoptimized
              src={settings.logo}
              width={56}
              height={56}
              alt=""
              className="size-14 rounded-lg bg-white object-contain"
            />
          )}
          <p className="text-primary-700 dark:text-primary-300 text-lg font-bold">
            {settings.shopName[language]}
          </p>
          {settings.contact && (
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">{settings.contact}</p>
          )}
          <p className="text-muted-foreground max-w-sm text-xs leading-6">
            {settings.introduction[language]}
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {t("invoice")} <bdi>{invoice.number}</bdi>
          </h2>
          <Badge variant="ghost" className={invoiceStatusStyles[invoice.status]}>
            {t(`statuses.${invoice.status}`)}
          </Badge>
        </div>
      </header>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs">{t("date")}</dt>
          <dd>{f.dateTime(new Date(invoice.createdAt), invoiceDateOptions(locale))}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs">{t("order")}</dt>
          <dd>
            <bdi>{invoice.orderNumber}</bdi>
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs">{t("customer")}</dt>
          <dd>{invoice.customer?.name ?? t("customerPending")}</dd>
          {invoice.customer && (
            <dd className="text-muted-foreground text-xs">
              <bdi>{invoice.customer.phone}</bdi>
            </dd>
          )}
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs">{t("payment")}</dt>
          <dd>{t(`payments.${invoice.payment}`)}</dd>
        </div>
        {invoice.customer?.address && (
          <div className="space-y-1 sm:col-span-2">
            <dt className="text-muted-foreground text-xs">{t("address")}</dt>
            <dd className="text-xs leading-6 break-words">
              {invoice.customer.city} · {invoice.customer.address}
            </dd>
          </div>
        )}
      </dl>
      <table className="block w-full text-start text-xs sm:table">
        <caption className="sr-only">{t("items")}</caption>
        <thead className="bg-muted/40 hidden sm:table-header-group">
          <tr>
            {["product", "quantity", "unitPrice", "lineTotal"].map((key) => (
              <th key={key} scope="col" className="p-3 text-start font-medium">
                {t(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block sm:table-row-group">
          {invoice.lines.map((line, index) => (
            <tr
              key={`${line.productId}-${index}`}
              className="border-border/50 grid grid-cols-3 gap-3 border-b py-3 sm:table-row"
            >
              <td className="col-span-3 min-w-0 sm:p-3">
                <p className="font-medium break-words">{line.name}</p>
                {line.variantLabel && (
                  <p className="text-muted-foreground mt-1">{line.variantLabel}</p>
                )}
              </td>
              <td className="tabular-nums sm:p-3">
                <span className="text-muted-foreground mb-1 block text-[10px] sm:hidden">
                  {t("quantity")}
                </span>
                {f.number(line.quantity)}
              </td>
              <td className="tabular-nums sm:p-3">
                <span className="text-muted-foreground mb-1 block text-[10px] sm:hidden">
                  {t("unitPrice")}
                </span>
                {f.number(line.unitPrice)}
              </td>
              <td className="font-medium tabular-nums sm:p-3">
                <span className="text-muted-foreground mb-1 block text-[10px] sm:hidden">
                  {t("lineTotal")}
                </span>
                {f.number(line.quantity * line.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-xs">
          {t("amountsIn", { currency: t("currency") })}
        </p>
        <dl className="bg-muted/25 w-full space-y-3 rounded-xl p-4 text-sm sm:max-w-xs">
          <div className="flex justify-between gap-3">
            <dt>{t("subtotal")}</dt>
            <dd>{f.number(totals.subtotal)}</dd>
          </div>
          <div className="text-muted-foreground flex justify-between gap-3">
            <dt>{t("shipping")}</dt>
            <dd>{f.number(invoice.shipping)}</dd>
          </div>
          <div className="border-border/50 flex flex-wrap justify-between gap-3 border-t pt-3 font-bold">
            <dt>{t("total")}</dt>
            <dd>
              {f.number(totals.total)} <span className="text-xs font-normal">{t("currency")}</span>
            </dd>
          </div>
        </dl>
      </div>
      <footer className="border-border/50 text-muted-foreground border-t pt-4 text-xs leading-6 whitespace-pre-wrap">
        {settings.footer[language]}
      </footer>
    </article>
  );
}
