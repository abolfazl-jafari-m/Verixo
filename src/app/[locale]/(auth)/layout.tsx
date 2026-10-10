import Image from "next/image";
import type { ReactNode } from "react";

import brandLogo from "@/assets/brand.png";
import { Link } from "@/lib/i18n/navigations";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="bg-primary-200/40 dark:bg-primary-900/30 pointer-events-none absolute -start-24 top-0 size-80 rounded-full blur-3xl" />
      <div className="bg-secondary-200/40 dark:bg-secondary-900/20 pointer-events-none absolute -end-24 bottom-0 size-80 rounded-full blur-3xl" />
      <section className="bg-card/90 shadow-primary-950/5 relative w-full max-w-md rounded-[2rem] border border-white/70 p-6 shadow-xl backdrop-blur sm:p-8 dark:border-white/10">
        <Link
          href="/"
          className="focus-visible:ring-ring/30 mb-8 inline-flex focus-visible:rounded-lg focus-visible:ring-3 focus-visible:outline-none"
        >
          <Image src={brandLogo} alt="Verixo" className="h-auto w-32" priority />
        </Link>
        {children}
      </section>
    </main>
  );
}
