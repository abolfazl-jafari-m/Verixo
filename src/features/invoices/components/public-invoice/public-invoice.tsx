"use client";

import { AppState, ContentSkeleton } from "@/components/shared";
import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/features/orders/components/orders-provider/orders-provider";
import { invoiceFromOrder } from "../../utils";
import { InvoiceDocument } from "../invoice-document/invoice-document";
import styles from "./public-invoice.module.css";

export function PublicInvoice({ token }: { token: string }) {
  const t = useTranslations("invoices");
  const { orders, ready } = useOrders();
  const order = orders.find((item) => item.invoice.publicToken === token);
  return (
    <main className={`${styles.page} bg-muted/20 min-h-dvh px-4 py-6 sm:py-10`}>
      <div className="mx-auto max-w-3xl space-y-4">
        <header className={`${styles.controls} flex flex-wrap items-center justify-between gap-3`}>
          <h1 className="text-lg font-semibold">{t("publicTitle")}</h1>
          {ready && order && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              {t("print")}
            </Button>
          )}
        </header>
        <p className={`${styles.controls} text-muted-foreground text-xs leading-6`}>
          {t("localOnly")}
        </p>
        {!ready ? (
          <ContentSkeleton />
        ) : order ? (
          <InvoiceDocument invoice={invoiceFromOrder(order)} />
        ) : (
          <AppState kind="error" title={t("unavailable")} />
        )}
      </div>
    </main>
  );
}
