"use client";
import { ActionFeedback, ActionSpinner } from "@/components/shared";
import { useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { productQueryKey } from "@/features/products/services/product-service";
import { inventoryValues, wholeQuantity, type inventoryRows } from "../../domain";
import { inventoryRepository } from "../../repository";

export function StockAdjustment({
  row,
  onClose,
}: {
  row: ReturnType<typeof inventoryRows>[number];
  onClose: () => void;
}) {
  const t = useTranslations("inventory");
  const locale = useLocale();
  const f = useFormatter();
  const client = useQueryClient();
  const values = inventoryValues(row.item);
  const [stock, setStock] = useState(String(values.stock));
  const [threshold, setThreshold] = useState(String(values.threshold));
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const valid =
    stock.trim() !== "" &&
    threshold.trim() !== "" &&
    wholeQuantity(Number(stock)) &&
    wholeQuantity(Number(threshold)) &&
    Number(stock) >= values.reserved;
  async function save() {
    if (submitting.current || !valid) return;
    submitting.current = true;
    setBusy(true);
    setError(false);
    try {
      inventoryRepository.adjust(row.product.id, row.variantId, Number(stock), Number(threshold));
      await client.invalidateQueries({ queryKey: productQueryKey });
      toast.add({ title: t("saved"), type: "success" });
      onClose();
    } catch {
      setError(true);
      setConfirm(false);
      void client.invalidateQueries({ queryKey: productQueryKey });
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent dir={locale === "fa" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {t("adjust")} — {row.product.name} {row.label}
          </DialogTitle>
          <DialogDescription>{t("adjustHint")}</DialogDescription>
        </DialogHeader>
        <p className="text-sm">
          {t("reserved")}: {f.number(values.reserved)} · {t("available")}:{" "}
          {values.tracked ? f.number(values.available) : t("untracked")}
        </p>
        <label className="space-y-2 text-sm">
          {t("physical")}
          <Input
            type="number"
            min={values.reserved}
            step={1}
            value={stock}
            disabled={busy || confirm}
            onChange={(e) => setStock(e.target.value)}
          />
        </label>
        <label className="space-y-2 text-sm">
          {t("threshold")}
          <Input
            type="number"
            min={0}
            step={1}
            value={threshold}
            disabled={busy || confirm}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </label>
        {!valid && (
          <p role="alert" className="text-destructive text-sm">
            {t("invalid")}
          </p>
        )}
        {error && <ActionFeedback kind="error" message={t("saveError")} />}
        {confirm && (
          <p role="alert" className="text-sm">
            {t("confirm", { before: f.number(values.stock), after: f.number(Number(stock)) })}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => (confirm ? setConfirm(false) : onClose())}
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={!valid || busy}
            aria-busy={busy}
            onClick={() => (confirm ? void save() : setConfirm(true))}
          >
            {busy && <ActionSpinner />}
            {t(confirm ? "confirmAction" : "review")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
