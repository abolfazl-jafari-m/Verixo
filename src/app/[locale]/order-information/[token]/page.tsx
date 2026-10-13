import { getTranslations } from "next-intl/server";
import { CustomerInformationForm } from "@/features/orders/components";
import { ShopIdentity } from "@/features/settings/components";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getTranslations("orders.customerFlow");
  return (
    <main className="bg-muted/20 min-h-dvh px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-3">
          <ShopIdentity />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm leading-7">{t("description")}</p>
        </header>
        <CustomerInformationForm token={token} />
      </div>
    </main>
  );
}
