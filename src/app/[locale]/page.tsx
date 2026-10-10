"use client";

import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import brandLogo from "@/assets/brand.png";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigations";
import { cn } from "@/lib/utils";

const reveal = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  const t = useTranslations("splash");

  return (
    <main className="text-foreground min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Image src={brandLogo} alt="Verixo" className="h-auto w-32" priority />
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default" }), "h-fit rounded-lg! px-6 py-1.5")}
          >
            {t("login")}
          </Link>
        </motion.header>
        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <motion.section initial="hidden" animate="visible" transition={{ staggerChildren: 0.12 }}>
            <motion.div
              variants={reveal}
              className="bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-200 mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <Sparkles className="size-4" />
              {t("eyebrow")}
            </motion.div>
            <motion.h1
              variants={reveal}
              className="max-w-xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              variants={reveal}
              className="text-muted-foreground mt-5 max-w-lg text-base leading-7 sm:text-lg"
            >
              {t("description")}
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}
              >
                {t("cta")}
                <ArrowLeft className="ltr::rotate-180" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-6 text-base",
                )}
              >
                {t("login")}
              </Link>
            </motion.div>
            <motion.div
              variants={reveal}
              className="text-muted-foreground mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm"
            >
              {["benefitOne", "benefitTwo", "benefitThree"].map((benefit) => (
                <span key={benefit} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="text-secondary-600 size-4" />
                  {t(benefit)}
                </span>
              ))}
            </motion.div>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="bg-primary-200/45 dark:bg-primary-900/30 absolute -inset-6 rounded-[3rem] blur-3xl" />
            <div className="bg-card shadow-primary-950/10 relative rounded-[2rem] border border-white/70 p-5 shadow-2xl dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{t("previewEyebrow")}</p>
                  <p className="mt-1 text-xl font-bold">{t("previewTitle")}</p>
                </div>
                <span className="bg-success-100 text-success-700 rounded-xl px-2.5 py-1 text-xs font-semibold">
                  {t("previewStatus")}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric label={t("orders")} value="۲۴" />
                <Metric label={t("sales")} value="۱۲٫۸M" />
              </div>
              <div className="bg-muted mt-5 rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{t("chartTitle")}</span>
                  <span className="text-success-600">+۱۸٪</span>
                </div>
                <div className="mt-5 flex h-24 items-end gap-2">
                  {[38, 54, 43, 78, 62, 92, 75].map((height, index) => (
                    <motion.span
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.55 + index * 0.06 }}
                      className="bg-primary-400 last:bg-primary flex-1 rounded-t-md"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-2xl p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
