import { getTranslations } from "next-intl/server";
import { AppState } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigations";
export default async function NotFound() {
  const t = await getTranslations("appStates");
  return (
    <main className="mx-auto w-full max-w-2xl p-4 py-16">
      <AppState
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        action={
          <Link href="/dashboard" className={buttonVariants()}>
            {t("dashboard")}
          </Link>
        }
      />
    </main>
  );
}
