"use client";
import { Tabs } from "@base-ui/react/tabs";
import { useEffect, useRef } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigations";
import {
  ShopSettings,
  InvoiceSettingsForm,
  ShippingSettings,
  ReportSettings,
} from "../business-settings/business-settings";
import { AppearanceSettings } from "../appearance-settings/appearance-settings";

const tabs = ["shop", "invoices", "shipping", "reports", "appearance"] as const;
export function SettingsTabs() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const requested = useSearchParams().get("tab");
  const active = tabs.find((tab) => tab === requested) ?? "shop";
  const activeTab = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeTab.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);
  return (
    <DirectionProvider direction={locale === "fa" ? "rtl" : "ltr"}>
      <Tabs.Root
        value={active}
        onValueChange={(value) => {
          if (typeof value === "string" && tabs.some((tab) => tab === value))
            router.push(`/settings?tab=${value}`, { scroll: false });
        }}
        className="space-y-5"
      >
        <Tabs.List
          aria-label={t("title")}
          className="bg-muted/30 flex max-w-full gap-1 overflow-x-auto rounded-xl p-1"
        >
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab}
              ref={tab === active ? activeTab : undefined}
              value={tab}
              className="data-active:bg-card data-active:text-foreground text-muted-foreground focus-visible:ring-ring shrink-0 rounded-lg px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 data-active:shadow-sm"
            >
              {t(`tabs.${tab}`)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Panel
            key={tab}
            value={tab}
            className="border-border/50 bg-card space-y-5 rounded-2xl border p-5 sm:p-6"
          >
            <header className="space-y-2">
              <h2 className="text-lg font-semibold">{t(`tabs.${tab}`)}</h2>
              <p className="text-muted-foreground text-sm leading-6">{t(`descriptions.${tab}`)}</p>
            </header>
            {tab === "shop" ? (
              <ShopSettings />
            ) : tab === "invoices" ? (
              <InvoiceSettingsForm />
            ) : tab === "shipping" ? (
              <ShippingSettings />
            ) : tab === "reports" ? (
              <ReportSettings />
            ) : (
              <AppearanceSettings />
            )}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </DirectionProvider>
  );
}
