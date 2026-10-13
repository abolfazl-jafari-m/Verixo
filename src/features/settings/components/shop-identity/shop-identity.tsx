"use client";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useSettingsSection } from "../../use-settings";
export function ShopIdentity() {
  const locale = useLocale();
  const { value: shop } = useSettingsSection("shop");
  return (
    <div className="flex min-w-0 items-center gap-3">
      {shop.logo && (
        <Image
          unoptimized
          src={shop.logo}
          width={48}
          height={48}
          alt=""
          className="size-12 shrink-0 rounded-lg bg-white object-contain"
        />
      )}
      <p className="text-primary min-w-0 font-semibold break-words">
        {shop.name[locale === "fa" ? "fa" : "en"]}
      </p>
    </div>
  );
}
