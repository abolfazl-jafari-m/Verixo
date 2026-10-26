"use client";
import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ActionFeedback, ActionSpinner } from "@/components/shared";
import { formatInvoiceAsText } from "../../format-invoice-as-text";
import type { Invoice } from "../../types";

export function InvoiceCopyText({ invoice }: { invoice: Invoice }) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const f = useFormatter();
  const [copying, setCopying] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    if (copying) return;
    setCopying(true);
    setFailed(false);
    try {
      await navigator.clipboard.writeText(
        formatInvoiceAsText(invoice, { locale, translate: t, number: (value) => f.number(value) }),
      );
      toast.add({ title: t("textCopied"), type: "success" });
    } catch {
      setFailed(true);
    } finally {
      setCopying(false);
    }
  }
  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={copy} disabled={copying} aria-busy={copying}>
        {copying ? <ActionSpinner /> : <Copy className="size-4" />}
        {t("copyText")}
      </Button>
      {failed && <ActionFeedback kind="error" message={t("copyTextFailed")} />}
    </div>
  );
}
