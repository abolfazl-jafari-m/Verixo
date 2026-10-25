import { useTranslations } from "next-intl";
import { ProductCatalog } from "@/features/products/components";

export default function Page() {
  const t = useTranslations("products");
  return (
    <main className="mx-auto w-full max-w-[1440px] min-w-0 space-y-8 px-4 py-5 pb-28 sm:px-6 md:pb-8 lg:px-8 lg:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </header>
      <ProductCatalog />
    </main>
  );
}
