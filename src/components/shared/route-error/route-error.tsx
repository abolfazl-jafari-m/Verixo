"use client";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigations";
import { AppState } from "../app-state/app-state";
export function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("appStates");
  return (
    <div className="mx-auto w-full max-w-2xl p-4 py-12">
      <AppState
        kind="error"
        title={t("errorTitle")}
        description={t("errorDescription")}
        action={
          <>
            <Button onClick={reset}>{t("retry")}</Button>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              {t("home")}
            </Link>
          </>
        }
      />
    </div>
  );
}
