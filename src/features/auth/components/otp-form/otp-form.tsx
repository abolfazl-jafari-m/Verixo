"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useRouter } from "@/lib/i18n/navigations";

export function OtpForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const schema = z.object({ code: z.string().length(6, t("validation.otp")) });
  type OtpValues = z.infer<typeof schema>;
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({ resolver: zodResolver(schema), defaultValues: { code: "" } });
  function onSubmit() {
    router.push("/dashboard");
  }

  return (
    <>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold" htmlFor="otp">
            {t("otp.label")}
          </label>
          <div dir={"ltr"}>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <InputOTP
                  id="otp"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={Boolean(errors.code)}
                  containerClassName="justify-center"
                  className="w-full"
                >
                  <InputOTPGroup className="gap-2 border-0 bg-transparent">
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="bg-background size-11 rounded-xl border text-lg first:rounded-xl first:border last:rounded-xl"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </div>
          {errors.code && (
            <p className="text-destructive text-center text-sm" role="alert">
              {errors.code.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {t("otp.submit")}
        </Button>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        {t("otp.resendPrompt")}{" "}
        <button
          type="button"
          className="text-primary font-semibold underline-offset-4 hover:underline"
        >
          {t("otp.resend")}
        </button>
      </p>
    </>
  );
}
