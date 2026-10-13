"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Layers, Package, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Product, ProductStatus } from "../../types";
import { productSummary } from "../../utils";

const statusStyles: Record<ProductStatus, string> = {
  active: "bg-success-50 text-success-700 dark:bg-success-900/25 dark:text-success-300",
  draft: "bg-warning-50 text-warning-700 dark:bg-warning-900/25 dark:text-warning-300",
  archived: "bg-muted text-muted-foreground dark:bg-foreground/5 dark:text-foreground/60",
};

export function ProductTable({
  products,
  onEdit,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
}) {
  const t = useTranslations("products");
  const format = useFormatter();
  return (
    <Table className="[&_td]:px-5 [&_th]:px-5">
      <TableCaption className="sr-only">{t("title")}</TableCaption>
      <TableHeader className="bg-muted/40 [&_tr]:border-border/50">
        <TableRow className="hover:bg-transparent">
          {(["name", "type", "price", "stock", "status", "actions"] as const).map((key) => (
            <TableHead
              key={key}
              scope="col"
              className={cn(
                "text-muted-foreground h-11 text-xs font-medium",
                key === "actions" && "text-end",
              )}
            >
              {t(key)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const summary = productSummary(product);
          const price =
            summary.minPrice === null
              ? t("noActiveVariants")
              : `${format.number(summary.minPrice)}${summary.maxPrice !== null && summary.maxPrice !== summary.minPrice ? ` – ${format.number(summary.maxPrice)}` : ""} ${t("currency")}`;
          return (
            <TableRow
              key={product.id}
              className="group border-border/40 hover:bg-primary/3 transition-colors motion-reduce:transition-none"
            >
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar size="lg" className="after:border-border/40 rounded-xl after:rounded-xl">
                    <AvatarImage
                      className="rounded-xl"
                      src={product.images[0]}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback
                      className={cn(
                        "rounded-xl",
                        product.type === "variable"
                          ? "bg-primary/8 text-primary"
                          : "bg-muted/70 text-muted-foreground",
                      )}
                    >
                      {product.type === "variable" ? (
                        <Layers className="size-4.5" aria-hidden="true" />
                      ) : (
                        <Package className="size-4.5" aria-hidden="true" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-56 min-w-36 space-y-1">
                    <span className="block font-semibold break-words whitespace-normal">
                      {product.name}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      <bdi>{product.sku || "—"}</bdi>
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="ghost"
                  className={cn(
                    "h-6 rounded-md px-2 text-xs font-normal",
                    product.type === "variable"
                      ? "bg-primary/6 text-primary"
                      : "bg-muted/60 text-muted-foreground dark:bg-foreground/5 dark:text-foreground/60",
                  )}
                >
                  {t(`types.${product.type}`)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium tabular-nums">{price}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    summary.stock === 0 && "text-warning-700 dark:text-warning-300",
                  )}
                >
                  {format.number(summary.stock)}
                </span>
                <span className="text-muted-foreground ms-1.5 text-xs">{t("units")}</span>
                {product.type === "variable" && (
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {t("activeStock")}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="ghost"
                  className={cn(
                    "h-6 gap-1.5 rounded-full px-2.5 font-medium",
                    statusStyles[product.status],
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {t(`statuses.${product.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-end">
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/10 h-8 rounded-lg px-2.5"
                  aria-label={t("editNamed", { name: product.name })}
                  onClick={() => onEdit(product)}
                >
                  <Pencil aria-hidden="true" />
                  {t("editAction")}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
