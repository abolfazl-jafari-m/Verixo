"use client";

import { ActionFeedback, ActionSpinner } from "@/components/shared";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/navigations";
import { invoicePath } from "../../utils";

import type { Invoice } from "../../types";
import { InvoiceCopyText } from "../invoice-copy-text/invoice-copy-text";

export function InvoiceShare({ invoice }: { invoice: Invoice }) {
  const token = invoice.publicToken;
  const t = useTranslations("invoices");
  const locale = useLocale();
  const [copying, setCopying] = useState(false);
  const [fallback, setFallback] = useState("");
  async function copy() {
    if (copying) return;
    setCopying(true);
    const url = new URL(invoicePath(token, locale), window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ title: t("copied"), type: "success" });
      setFallback("");
    } catch {
      setFallback(url);
    } finally {
      setCopying(false);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        <InvoiceCopyText invoice={invoice} />
        <Button variant="outline" onClick={copy} disabled={copying} aria-busy={copying}>
          {copying ? <ActionSpinner /> : <Copy className="size-4" />}
          {t("copy")}
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={
            <Link
              href={`/invoice/${encodeURIComponent(token)}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLink className="size-4" />
          {t("openPrint")}
        </Button>
      </div>
      {fallback && <ActionFeedback kind="error" message={t("copyFailed")} />}
      {fallback && (
        <Input
          dir="ltr"
          readOnly
          aria-label={t("publicLink")}
          value={fallback}
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  );
}
