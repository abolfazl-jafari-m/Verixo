"use client";

import { AppState, ContentSkeleton } from "@/components/shared";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productService, productQueryKey } from "../../services/product-service";
import type { Product } from "../../types";
import { filterProducts, type ProductFilters as Filters } from "../../utils";
import { ProductFilters, emptyProductFilters } from "../product-filters/product-filters";
import { ProductTable } from "../product-table/product-table";
import { ProductEditor } from "../product-editor/product-editor";

const queryKey = productQueryKey;

export function ProductCatalog({ initialCreate = false }: { initialCreate?: boolean }) {
  const t = useTranslations("products");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey, queryFn: productService.list });
  const mutation = useMutation({ mutationFn: productService.save });
  const [filters, setFilters] = useState(emptyProductFilters);
  const [editor, setEditor] = useState<{ product?: Product } | null>(initialCreate ? {} : null);
  const products = query.data ?? [];
  const filtered = filterProducts(products, filters);

  function changeFilters(next: Filters) {
    setFilters(next);
  }
  function openEditor(product?: Product) {
    setEditor({ product });
  }
  async function save(product: Product) {
    const result = await mutation.mutateAsync(product);
    queryClient.setQueryData<Product[]>(queryKey, (previous = []) =>
      previous.some((item) => item.id === result.id)
        ? previous.map((item) => (item.id === result.id ? result : item))
        : [result, ...previous],
    );
    setEditor(null);
    toast.add({ title: t("saved"), type: "success" });
  }

  return (
    <section className="space-y-6" aria-label={t("title")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">{t("demoNotice")}</p>
        <Button className="h-10 px-4" onClick={() => openEditor()}>
          <Plus aria-hidden="true" />
          {t("create")}
        </Button>
      </div>
      <ProductFilters filters={filters} onChange={changeFilters} />
      {query.isPending ? (
        <ContentSkeleton />
      ) : query.isError ? (
        <AppState
          kind="error"
          title={t("loadError")}
          action={
            <Button variant="outline" disabled={query.isFetching} onClick={() => query.refetch()}>
              {t("retry")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="min-w-0">
            {filtered.length ? (
              <ProductTable products={filtered} onEdit={openEditor} />
            ) : (
              <AppState
                title={t(products.length ? "noMatches" : "empty")}
                description={t(products.length ? "noMatchesHint" : "emptyHint")}
                action={
                  <Button
                    variant="outline"
                    onClick={() =>
                      products.length ? changeFilters(emptyProductFilters) : openEditor()
                    }
                  >
                    {t(products.length ? "clearFilters" : "create")}
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}
      <ProductEditor
        editor={editor}
        isSaving={mutation.isPending}
        onSave={save}
        onClose={() => setEditor(null)}
      />
    </section>
  );
}
