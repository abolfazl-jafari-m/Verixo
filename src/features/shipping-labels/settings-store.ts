"use client";
import { useLocale } from "next-intl";
import { resolveSender } from "@/features/settings/model";
import { readSettingsSection } from "@/features/settings/storage";
import { useSettingsSection } from "@/features/settings/use-settings";

// Shipping presentation retains its existing view model; persisted ownership is centralized.
export function readSenderSettings(locale = "fa") {
  const shop = readSettingsSection("shop");
  const shipping = readSettingsSection("shipping");
  return {
    settings: resolveSender(shop.value, shipping.value, locale),
    available: shop.available && shipping.available,
  };
}
export function useSenderSettings() {
  const locale = useLocale();
  const shop = useSettingsSection("shop");
  const shipping = useSettingsSection("shipping");
  return {
    settings: resolveSender(shop.value, shipping.value, locale),
    defaultFormat: shipping.value.format,
    available: shop.available && shipping.available,
    ready: shop.ready && shipping.ready,
  };
}
