import { getTranslations } from "next-intl/server";
import { InventoryWorkspace } from "@/features/inventory/components";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getTranslations("inventory");
  const { status } = await searchParams;
  const initialStatus = ["all", "alerts", "low", "out", "in", "untracked"].includes(status ?? "")
    ? status
    : "all";
  return (
    <main className="mx-auto w-full max-w-[1440px] min-w-0 space-y-8 px-4 py-5 pb-28 sm:px-6 md:pb-8 lg:px-8 lg:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </header>
      <InventoryWorkspace initialStatus={initialStatus} />
    </main>
  );
}
