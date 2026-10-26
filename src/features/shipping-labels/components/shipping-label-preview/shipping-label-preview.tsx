"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Printer, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppState, ContentSkeleton, ActionFeedback, ActionSpinner } from "@/components/shared";
import { Link } from "@/lib/i18n/navigations";
import type { Order } from "@/features/orders/types";
import {
  partitionOrders,
  recipientIssues,
  senderSchema,
  toLabel,
  type LabelFormat,
} from "../../model";
import { useSenderSettings } from "../../settings-store";
import { ShippingLabel } from "../shipping-label/shipping-label";

export function ShippingLabelPreview({
  orders,
  onClose,
}: {
  orders: Order[];
  onClose: () => void;
}) {
  const t = useTranslations("shippingLabels");
  const locale = useLocale();
  const { settings, ready, available, defaultFormat } = useSenderSettings();
  const [selectedFormat, setFormat] = useState<LabelFormat | null>(null);
  const format = selectedFormat ?? defaultFormat;
  const [result, setResult] = useState<{ key: string; url?: string; error?: boolean }>({ key: "" });
  const [retry, setRetry] = useState(0);
  const [printError, setPrintError] = useState(false);
  const [pdfView, setPdfView] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const [loadedUrl, setLoadedUrl] = useState("");
  const { valid, invalid } = partitionOrders(orders);
  const labels = valid.map(toLabel);
  const senderValid = senderSchema.safeParse(settings).success;
  const messages = {
    title: t("title"),
    sender: t("sender"),
    recipient: t("recipient"),
    phone: t("phone"),
    postalCode: t("postalCode"),
    order: t("order"),
  };
  // A content key prevents downloads of stale recipient/settings/format/locale data.
  const key = JSON.stringify({ labels, settings, format, locale, messages, retry });
  const canGenerate = ready && available && senderValid && labels.length > 0;
  useEffect(() => {
    if (!canGenerate) return;
    let cancelled = false;
    let url: string | undefined;
    const snapshot: {
      labels: typeof labels;
      settings: typeof settings;
      format: LabelFormat;
      locale: string;
      messages: typeof messages;
    } = JSON.parse(key);
    void import("../../pdf")
      .then(async ({ buildLabelPdf, loadLabelFont }) => {
        const font = await loadLabelFont();
        if (cancelled) return;
        const pdf = buildLabelPdf(
          snapshot.labels,
          snapshot.settings,
          snapshot.format,
          snapshot.locale,
          snapshot.messages,
          font,
        );
        url = URL.createObjectURL(pdf.output("blob"));
        setResult({ key, url });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, error: true });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key, canGenerate]);
  const url = canGenerate && result.key === key ? result.url : undefined;
  const failed = canGenerate && result.key === key && result.error;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="flex max-h-[92dvh] flex-col sm:max-w-3xl"
      >
        <DialogTitle>{t("preview")}</DialogTitle>
        <DialogDescription>{t("previewHint")}</DialogDescription>
        <div className="min-h-0 space-y-4 overflow-y-auto px-1">
          {!ready && <ContentSkeleton variant="document" />}
          {ready && (!senderValid || !available) && (
            <div className="bg-muted rounded-xl p-4 text-sm">
              <p>{t(!available ? "storageError" : "configureSender")}</p>
              <Link href="/settings?tab=shop" className="text-primary mt-2 inline-block underline">
                {t("settings")}
              </Link>
            </div>
          )}
          {invalid.length > 0 && (
            <section
              className="bg-muted/50 space-y-2 rounded-xl p-3 text-sm"
              aria-label={t("excluded")}
            >
              <p className="font-medium">{t("excludedCount", { count: invalid.length })}</p>
              <ul className="space-y-1">
                {invalid.map((order) => (
                  <li key={order.id}>
                    <bdi>{order.number}</bdi>:{" "}
                    {recipientIssues(order)
                      .map((field) => t(`recipientFields.${field}`))
                      .join(" · ")}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {ready && !labels.length && (
            <AppState
              icon={Package}
              title={t("noValid")}
              description={t("previewHint")}
              className="py-6"
            />
          )}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <label htmlFor="label-format" className="text-sm font-medium">
                {t("format")}
              </label>
              <Select
                value={format}
                items={[
                  { value: "a6", label: t("a6") },
                  { value: "thermal", label: t("thermal") },
                ]}
                onValueChange={(value) => {
                  if (value === "a6" || value === "thermal") setFormat(value);
                }}
              >
                <SelectTrigger id="label-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={locale === "fa" ? "rtl" : "ltr"}>
                  <SelectItem value="a6">{t("a6")}</SelectItem>
                  <SelectItem value="thermal">{t("thermal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("validCount", { count: labels.length })}
            </p>
            {url && (
              <Button variant="outline" onClick={() => setPdfView((value) => !value)}>
                {t(pdfView ? "readablePreview" : "exactPreview")}
              </Button>
            )}
          </div>
          {canGenerate && !url && !failed && (
            <p role="status" className="flex items-center gap-2 text-sm">
              <ActionSpinner />
              {t("generating")}
            </p>
          )}
          {(failed || printError) && (
            <div className="space-y-2">
              <ActionFeedback kind="error" message={t(printError ? "printError" : "pdfError")} />
              <Button
                variant="outline"
                onClick={() => {
                  setPrintError(false);
                  setRetry((value) => value + 1);
                }}
              >
                {t("retry")}
              </Button>
            </div>
          )}
          {url && (
            <iframe
              ref={frame}
              src={url}
              title={t("exactPreview")}
              onLoad={() => setLoadedUrl(url)}
              className={
                pdfView
                  ? "h-[55dvh] w-full rounded-xl border"
                  : "pointer-events-none absolute h-px w-px opacity-0"
              }
              aria-hidden={!pdfView}
              tabIndex={pdfView ? 0 : -1}
            />
          )}
          {!pdfView && senderValid && (
            <div className="bg-muted/40 space-y-4 rounded-xl p-3 sm:p-5">
              {labels.map((label) => (
                <ShippingLabel key={label.id} label={label} sender={settings} format={format} />
              ))}
            </div>
          )}
        </div>
        <footer className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            disabled={!url}
            onClick={() => {
              if (!url) return;
              const a = document.createElement("a");
              a.href = url;
              a.download = `shipping-labels-${format}.pdf`;
              a.click();
            }}
          >
            <Download className="size-4" />
            {t("download")}
          </Button>
          <Button
            variant="secondary"
            disabled={!url || loadedUrl !== url}
            onClick={() => {
              try {
                if (!frame.current?.contentWindow) throw new Error();
                frame.current.contentWindow.focus();
                frame.current.contentWindow.print();
              } catch {
                setPrintError(true);
              }
            }}
          >
            <Printer className="size-4" />
            {t("print")}
          </Button>
          <Button variant="ghost" className="ms-auto" onClick={onClose}>
            {t("close")}
          </Button>
          <p className="text-muted-foreground w-full text-xs">{t("printHint")}</p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
