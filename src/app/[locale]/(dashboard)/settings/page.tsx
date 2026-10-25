import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { SettingsTabs } from "@/features/settings/components";
import { ContentSkeleton } from "@/components/shared";
export default function Page() {
  const t = useTranslations("settings");
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm leading-6">{t("description")}</p>
      </header>
      <Suspense fallback={<ContentSkeleton />}>
        <SettingsTabs />
      </Suspense>
    </div>
  );
}
