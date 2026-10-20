"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/navigations";
import type { Order } from "../../types";
import { customerFormPath } from "../../mock-workflow";

export function CustomerFormLink({ order }: { order: Order }) {
  const t = useTranslations("orders.customerFlow");
  const locale = useLocale();
  const [feedback, setFeedback] = useState<"copied" | "copyFailed" | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState("");
  if (order.status === "cancelled") return null;
  if (order.payment !== "paid" || !order.customerFormToken) {
    return <p className="text-muted-foreground p-2 text-xs leading-5">{t("afterPayment")}</p>;
  }
  if (order.customerInformationStatus === "submitted") {
    return <p className="text-muted-foreground text-xs">{t("submitted")}</p>;
  }
  const token = order.customerFormToken;
  async function copy() {
    const url = new URL(customerFormPath(token, locale), window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("copied");
      setFallbackUrl("");
    } catch {
      setFallbackUrl(url);
      setFeedback("copyFailed");
    }
  }
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Button variant="secondary" className="h-auto min-h-10 whitespace-normal" onClick={copy}>
        <Copy className="size-4 shrink-0" />
        {t("copy")}
      </Button>
      <Link
        href={`/order-information/${encodeURIComponent(token)}`}
        className="text-primary focus-visible:ring-ring rounded px-2 py-1 text-xs underline outline-none focus-visible:ring-2"
      >
        {t("open")}
      </Link>
      {feedback && (
        <p role="status" className="text-muted-foreground px-2 text-xs leading-5">
          {t(feedback)}
        </p>
      )}
      {fallbackUrl && (
        <Input
          aria-label={t("link")}
          dir="ltr"
          readOnly
          value={fallbackUrl}
          onFocus={(event) => event.target.select()}
        />
      )}
      <p className="text-muted-foreground px-2 text-[11px] leading-5">{t("localOnly")}</p>
    </div>
  );
}
