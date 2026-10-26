"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionSpinner } from "@/components/shared";
import { readLogo } from "@/features/shipping-labels/logo";
import type { Settings } from "../../model";
import {
  SectionEditor,
  SettingsField,
  SettingsSelect,
  SettingsSwitch,
} from "../section-editor/section-editor";

export function ShopSettings() {
  return (
    <SectionEditor section="shop">
      {(form, setBusy) => <ShopFields form={form} onBusy={setBusy} />}
    </SectionEditor>
  );
}
function ShopFields({
  form,
  onBusy,
}: {
  form: UseFormReturn<Settings["shop"]>;
  onBusy: (busy: boolean) => void;
}) {
  const t = useTranslations("settings");
  const labels = useTranslations("shippingLabels");
  const logo = useWatch({ control: form.control, name: "logo" });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField form={form} name="name.fa" label={t("nameFa")} dir="rtl" />
        <SettingsField form={form} name="name.en" label={t("nameEn")} dir="ltr" />
      </div>
      <section className="bg-muted/30 space-y-3 rounded-xl p-4">
        <label htmlFor="shop-logo" className="text-sm font-medium">
          {labels("logo")}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {logo ? (
            <Image
              unoptimized
              width={64}
              height={64}
              src={logo}
              alt={labels("logo")}
              className="size-16 rounded-lg bg-white object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-sm">{labels("noLogo")}</p>
          )}
          <Input
            id="shop-logo"
            className="min-w-0 flex-1"
            type="file"
            accept="image/png,image/jpeg"
            disabled={uploading}
            aria-describedby="logo-hint"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const version = ++request.current;
              setUploading(true);
              onBusy(true);
              setError(false);
              try {
                const data = await readLogo(file);
                if (version === request.current)
                  form.setValue("logo", data, { shouldDirty: true, shouldValidate: true });
              } catch {
                if (version === request.current) setError(true);
              } finally {
                if (version === request.current) {
                  setUploading(false);
                  onBusy(false);
                }
              }
            }}
          />
          {uploading && (
            <span role="status" aria-label={labels("loading")}>
              <ActionSpinner />
            </span>
          )}
          {logo && (
            <Button
              type="button"
              variant="ghost"
              disabled={uploading}
              onClick={() => form.setValue("logo", "", { shouldDirty: true, shouldValidate: true })}
            >
              {labels("removeLogo")}
            </Button>
          )}
        </div>
        <p id="logo-hint" className="text-muted-foreground text-xs">
          {labels("logoHint")}
        </p>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {labels("logoError")}
          </p>
        )}
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField form={form} name="phone" label={t("phone")} dir="ltr" maxLength={25} />
        <SettingsField
          form={form}
          name="postalCode"
          label={t("postalCode")}
          dir="ltr"
          maxLength={15}
        />
      </div>
      <SettingsField form={form} name="address" label={t("address")} multiline maxLength={500} />
      <p className="text-muted-foreground text-xs">{t("contactHint")}</p>
    </>
  );
}
export function InvoiceSettingsForm() {
  const t = useTranslations("settings");
  return (
    <SectionEditor section="invoices">
      {(form) => (
        <>
          <p className="bg-muted/30 rounded-xl p-4 text-sm leading-6">{t("snapshotHint")}</p>
          <fieldset className="bg-muted/30 space-y-4 rounded-xl p-4">
            <legend className="font-medium">{t("paymentInformation")}</legend>
            <SettingsField
              form={form}
              name="paymentInformation.accountHolder"
              label={t("accountHolder")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField
                form={form}
                name="paymentInformation.cardNumber"
                label={t("cardNumber")}
                dir="ltr"
                maxLength={40}
              />
              <SettingsField
                form={form}
                name="paymentInformation.accountNumber"
                label={t("accountNumber")}
                dir="ltr"
                maxLength={100}
              />
            </div>
            <p className="text-muted-foreground text-xs">{t("paymentHint")}</p>
          </fieldset>
          {(["fa", "en"] as const).map((locale) => (
            <fieldset key={locale} className="space-y-4">
              <legend className="mb-3 font-medium">{t(locale)}</legend>
              <SettingsField
                form={form}
                name={`introduction.${locale}`}
                label={t("introduction")}
                multiline
                dir={locale === "fa" ? "rtl" : "ltr"}
                maxLength={1000}
              />
              <SettingsField
                form={form}
                name={`footer.${locale}`}
                label={t("footer")}
                multiline
                dir={locale === "fa" ? "rtl" : "ltr"}
                maxLength={1000}
              />
            </fieldset>
          ))}
        </>
      )}
    </SectionEditor>
  );
}
export function ShippingSettings() {
  return (
    <SectionEditor section="shipping">{(form) => <ShippingFields form={form} />}</SectionEditor>
  );
}
function ShippingFields({ form }: { form: UseFormReturn<Settings["shipping"]> }) {
  const t = useTranslations("settings");
  const labels = useTranslations("shippingLabels");
  const shared = useWatch({ control: form.control, name: "useShopContact" });
  return (
    <>
      <p className="text-muted-foreground text-sm">{t("shippingHint")}</p>
      <SettingsField
        form={form}
        name="senderName"
        label={labels("senderName") + " " + labels("optional")}
      />
      <SettingsSwitch form={form} name="useShopContact" label={t("useShopContact")} />
      {!shared && (
        <div className="bg-muted/20 space-y-4 rounded-xl p-4">
          <SettingsField
            form={form}
            name="phone"
            label={labels("senderPhone")}
            dir="ltr"
            maxLength={25}
          />
          <SettingsField
            form={form}
            name="address"
            label={labels("senderAddress")}
            multiline
            maxLength={500}
          />
          <SettingsField
            form={form}
            name="postalCode"
            label={labels("senderPostalCode")}
            dir="ltr"
            maxLength={15}
          />
        </div>
      )}
      <Controller
        control={form.control}
        name="format"
        render={({ field }) => (
          <SettingsSelect
            id="default-label-format"
            label={t("defaultFormat")}
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: "a6", label: labels("a6") },
              { value: "thermal", label: labels("thermal") },
            ]}
          />
        )}
      />
    </>
  );
}
export function ReportSettings() {
  const t = useTranslations("settings");
  const reports = useTranslations("reports");
  return (
    <SectionEditor section="reports">
      {(form) => (
        <>
          <Controller
            control={form.control}
            name="period"
            render={({ field }) => (
              <SettingsSelect
                id="default-report-period"
                label={t("defaultPeriod")}
                value={field.value}
                onChange={field.onChange}
                options={(["today", "week", "month", "currentMonth", "previousMonth"] as const).map(
                  (value) => ({ value, label: reports(`presets.${value}`) }),
                )}
              />
            )}
          />
          <SettingsSwitch form={form} name="compare" label={t("defaultCompare")} />
          <p className="text-muted-foreground text-xs">{t("reportHint")}</p>
        </>
      )}
    </SectionEditor>
  );
}
