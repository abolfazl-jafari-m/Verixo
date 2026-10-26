"use client";

import { AppState } from "@/components/shared";
import { Link } from "@/lib/i18n/navigations";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Product } from "@/features/products/types";

export function ProductPicker({
  onAdd,
  catalog,
}: {
  onAdd: (id: string) => void;
  catalog: Product[];
}) {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const products = catalog.filter(
    (product) =>
      product.status === "active" &&
      `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" className="h-10" />}>
        <Plus className="size-4" />
        {t("addProduct")}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="w-80 max-w-[calc(100vw-2rem)] gap-2 rounded-2xl p-3"
      >
        <label htmlFor="product-picker-search" className="sr-only">
          {t("searchProducts")}
        </label>
        <div className="relative">
          <Search className="text-muted-foreground absolute start-3 top-3 size-4" />
          <Input
            id="product-picker-search"
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 ps-9"
            placeholder={t("searchProducts")}
          />
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {products.map((product) => (
            <Button
              key={product.id}
              variant="ghost"
              className="h-auto w-full justify-start py-3 text-start whitespace-normal"
              onClick={() => {
                onAdd(product.id);
                setOpen(false);
                setSearch("");
              }}
            >
              {product.name}
              <span className="text-muted-foreground ms-auto text-xs">{t(product.type)}</span>
            </Button>
          ))}
          {products.length === 0 && (
            <AppState
              icon={Search}
              title={t("noProducts")}
              className="border-0 px-2 py-5"
              action={
                search ? (
                  <Button variant="ghost" onClick={() => setSearch("")}>
                    {t("clear")}
                  </Button>
                ) : (
                  <Link href="/products" className={buttonVariants({ variant: "outline" })}>
                    {t("manageProducts")}
                  </Link>
                )
              }
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
