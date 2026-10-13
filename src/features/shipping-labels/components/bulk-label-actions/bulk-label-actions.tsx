"use client";
import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
export function BulkLabelActions({
  count,
  total,
  onSelectAll,
  onPreview,
}: {
  count: number;
  total: number;
  onSelectAll: (checked: boolean) => void;
  onPreview: () => void;
}) {
  const t = useTranslations("shippingLabels");
  return (
    <div className="border-border/40 bg-card flex flex-wrap items-center gap-3 rounded-xl border p-3">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={total > 0 && count === total}
          indeterminate={count > 0 && count < total}
          disabled={!total}
          onCheckedChange={(checked) => onSelectAll(checked)}
        />
        {t("selectAll")}
      </label>
      <p role="status" className="text-muted-foreground text-xs">
        {t("selectedCount", { count })}
      </p>
      <Button variant="secondary" className="ms-auto" disabled={!count} onClick={onPreview}>
        <Printer className="size-4" />
        {t("bulkPrint")}
      </Button>
      <p className="text-muted-foreground w-full text-xs">{t("selectionHint")}</p>
    </div>
  );
}
