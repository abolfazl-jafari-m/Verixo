"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/lib/i18n/navigations";

export type PhoneAuthFormProps = { mode: "login" | "signup" };

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizePhoneNumber(phone: string) {
  return phone
    .trim()
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[\s()-]/g, "");
}

function isIranianMobileNumber(phone: string) {
  return /^(?:\+98|0098|98|0)?9\d{9}$/.test(normalizePhoneNumber(phone));
}

export function PhoneAuthForm({ mode }: PhoneAuthFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const schema = z.object({
    phone: z
      .string()
      .trim()
      .refine(isIranianMobileNumber, t("validation.phone")),
  });
  type FormValues = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { phone: "" } });
  const otherMode = mode === "login" ? "signup" : "login";

  function onSubmit({ phone }: FormValues) {
    router.push({ pathname: "/login/otp", query: { phone: normalizePhoneNumber(phone), mode } });
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-primary text-sm font-medium">{t(`${mode}.eyebrow`)}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t(`${mode}.title`)}</h1>
        <p className="text-muted-foreground text-sm leading-6">{t(`${mode}.description`)}</p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-semibold">
            {t("phone.label")}
          </label>
          <div className="relative">
            <Phone
              className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="phone"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("phone.placeholder")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className="h-12 ps-4 pe-10 text-left"
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className="text-destructive text-sm" role="alert" aria-live="polite">
              {errors.phone.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {t("phone.continue")}
        </Button>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        {t(`${mode}.prompt`)}{" "}
        <Link
          href={otherMode === "login" ? "/login" : "/sign-up"}
          className="text-primary font-semibold underline-offset-4 hover:underline"
        >
          {t(`${mode}.action`)}
        </Link>
      </p>
    </>
  );
}
