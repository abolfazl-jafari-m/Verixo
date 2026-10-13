"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceDialog } from "@/features/invoices/components/invoice-dialog/invoice-dialog";
import type { Order } from "../../types";

export function OrderInvoiceDialog({ order }: { order: Order }) {
  const t = useTranslations("orders");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="h-10 w-full gap-2 rounded-lg text-xs" onClick={() => setOpen(true)}>
        <Send className="size-4" />
        {t("invoice.send")}
      </Button>
      {open && <InvoiceDialog orderId={order.id} onClose={() => setOpen(false)} />}
    </>
  );
}
