"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Product } from "../../types";
import { ProductForm } from "../product-form/product-form";
import { ProductConfirmation } from "../product-confirmation/product-confirmation";

interface ProductEditorProps {
  editor: { product?: Product } | null;
  isSaving: boolean;
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

export function ProductEditor({ editor, isSaving, onSave, onClose }: ProductEditorProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const [confirmClose, setConfirmClose] = useState(false);
  return (
    <Sheet
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open && !isSaving) setConfirmClose(true);
      }}
    >
      <SheetContent
        side={locale === "fa" ? "left" : "right"}
        showCloseButton={false}
        className="overflow-y-auto border-0 shadow-2xl data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-3xl data-[side=right]:sm:max-w-3xl"
        dir={locale === "fa" ? "rtl" : "ltr"}
      >
        <SheetHeader className="gap-2 pb-8">
          <SheetTitle className="text-xl font-semibold">
            {t(editor?.product ? "edit" : "create")}
          </SheetTitle>
          <SheetDescription>{t("formHint")}</SheetDescription>
        </SheetHeader>
        {editor && (
          <ProductForm
            key={editor.product?.id ?? "new"}
            product={editor.product}
            onSave={onSave}
            onCancel={onClose}
          />
        )}
        <ProductConfirmation
          open={confirmClose}
          description={t("discard")}
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => {
            setConfirmClose(false);
            onClose();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
