"use client";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { formats, type LabelData, type LabelFormat, type SenderSettings } from "../../model";

// Accessible HTML companion to the exact PDF preview. Numeric values are isolated.
export function ShippingLabel({
  label,
  sender,
  format,
}: {
  label: LabelData;
  sender: SenderSettings;
  format: LabelFormat;
}) {
  const t = useTranslations("shippingLabels");
  const locale = useLocale();
  return (
    <article
      data-shipping-label
      dir={locale === "fa" ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-sm space-y-4 rounded-sm border border-black/30 bg-white p-5 text-black shadow-sm"
      style={{ minHeight: 380, aspectRatio: `${formats[format].width}/${formats[format].height}` }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold break-words">{sender.shopName}</h3>
          <p className="mt-2 text-xs">
            {t("order")}: <bdi>{label.number}</bdi>
          </p>
        </div>
        {sender.logo && (
          <Image
            unoptimized
            width={56}
            height={56}
            src={sender.logo}
            alt=""
            className="size-14 shrink-0 object-contain"
          />
        )}
      </header>
      {[
        {
          heading: t("sender"),
          name: sender.senderName,
          phone: sender.senderPhone,
          address: sender.senderAddress,
          postalCode: sender.senderPostalCode,
        },
        { heading: t("recipient"), ...label.recipient },
      ].map((block) => (
        <section
          key={block.heading}
          className="space-y-2 border-t border-black/30 pt-3 text-sm leading-relaxed [overflow-wrap:anywhere]"
        >
          <h4 className="text-xs font-semibold">{block.heading}</h4>
          {block.name && <p>{block.name}</p>}
          <p>
            {t("phone")}: <bdi dir="ltr">{block.phone}</bdi>
          </p>
          <p className="whitespace-pre-wrap">{block.address}</p>
          {block.postalCode && (
            <p>
              {t("postalCode")}: <bdi dir="ltr">{block.postalCode}</bdi>
            </p>
          )}
        </section>
      ))}
    </article>
  );
}
