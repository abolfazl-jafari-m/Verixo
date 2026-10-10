import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { OtpForm } from "@/features/auth/components/otp-form/otp-form";
import { Link } from "@/lib/i18n/navigations";

type LoginOtpPageProps = {
  searchParams: Promise<{ phone?: string | string[]; mode?: string | string[] }>;
};

export default async function LoginOtpPage({ searchParams }: LoginOtpPageProps) {
  const t = await getTranslations("auth");
  const { phone: phoneParam, mode: modeParam } = await searchParams;
  const phone = typeof phoneParam === "string" ? phoneParam : t("otp.phoneFallback");
  const backPath = modeParam === "signup" ? "/sign-up" : "/login";

  return (
    <>
      <Link
        href={backPath}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/30 mb-6 inline-flex items-center gap-2 text-sm font-medium focus-visible:rounded-lg focus-visible:ring-3 focus-visible:outline-none"
      >
        {t("otp.back")}
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
      </Link>
      <div className="space-y-2">
        <p className="text-primary text-sm font-medium">{t("otp.eyebrow")}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("otp.title")}</h1>
        <p className="text-muted-foreground text-sm leading-6">{t("otp.description", { phone })}</p>
      </div>
      <OtpForm />
    </>
  );
}
