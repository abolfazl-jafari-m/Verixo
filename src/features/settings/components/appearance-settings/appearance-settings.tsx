"use client";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigations";
import { SettingsSelect } from "../section-editor/section-editor";

export function AppearanceSettings() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-5">
      <SettingsSelect
        id="settings-theme"
        label={t("theme")}
        value={theme ?? "dark"}
        onChange={setTheme}
        options={["light", "dark", "system"].map((value) => ({ value, label: t(value) }))}
      />
      <SettingsSelect
        id="settings-language"
        label={t("language")}
        value={locale}
        onChange={(value) => {
          if (value === "fa" || value === "en")
            router.replace("/settings?tab=appearance", { locale: value, scroll: false });
        }}
        options={[
          { value: "fa", label: t("fa") },
          { value: "en", label: t("en") },
        ]}
      />
      <p className="text-muted-foreground text-sm leading-6">{t("appearanceHint")}</p>
    </div>
  );
}
