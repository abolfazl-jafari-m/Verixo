"use client";

import type { ComponentProps } from "react";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductConfirmationProps {
  open: boolean;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  finalFocus?: ComponentProps<typeof DialogContent>["finalFocus"];
}

export function ProductConfirmation({
  open,
  description,
  onConfirm,
  onCancel,
  finalFocus,
}: ProductConfirmationProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        finalFocus={finalFocus}
        dir={locale === "fa" ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {t("continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
