"use client";

import { AppState, ContentSkeleton } from "@/components/shared";
import { useTranslations } from "next-intl";
import { Printer, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { invoiceFromOrder } from "../../utils";
import { InvoiceDocument } from "../invoice-document/invoice-document";
import { InvoiceCopyText } from "../invoice-copy-text/invoice-copy-text";
import styles from "./public-invoice.module.css";

export function PublicInvoice({ token }: { token: string }) {
  const t = useTranslations("invoices");
  const orders = useOrdersStore((state) => state.orders);
  const states = useTranslations("appStates");
  const storageAvailable = useOrdersStore((state) => state.storageAvailable);
  const ready = useOrdersStore((state) => state.ready);
  const order = orders.find((item) => item.invoice.publicToken === token);
  return (
    <main className={`${styles.page} bg-muted/20 min-h-dvh px-4 py-6 sm:py-10`}>
      <div className="mx-auto max-w-3xl space-y-4">
        <header className={`${styles.controls} flex flex-wrap items-center justify-between gap-3`}>
          <h1 className="text-lg font-semibold">{t("publicTitle")}</h1>
          {ready && order && (
            <div className="flex flex-wrap items-start gap-2">
              <InvoiceCopyText invoice={invoiceFromOrder(order)} />
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="size-4" />
                {t("print")}
              </Button>
            </div>
          )}
        </header>
        <p className={`${styles.controls} text-muted-foreground text-xs leading-6`}>
          {t("localOnly")}
        </p>
        {!ready ? (
          <ContentSkeleton variant="document" />
        ) : !storageAvailable && !order ? (
          <AppState
            kind="error"
            title={states("readError")}
            description={states("readErrorHint")}
            action={
              <Button variant="outline" onClick={() => window.dispatchEvent(new Event("focus"))}>
                {states("retry")}
              </Button>
            }
          />
        ) : order ? (
          <InvoiceDocument invoice={invoiceFromOrder(order)} />
        ) : (
          <AppState icon={FileQuestion} title={t("missingTitle")} description={t("unavailable")} />
        )}
      </div>
    </main>
  );
}
