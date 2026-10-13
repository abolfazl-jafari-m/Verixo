import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/i18n/navigations";
import { OrderForm } from "@/features/orders/components";

export default function Page() {
  const t = useTranslations("orders");
  return (
    <div className="mx-auto w-full max-w-[1200px] min-w-0 space-y-6 px-4 py-5 pb-28 sm:px-6 md:pb-8 lg:px-8 lg:py-8">
      <header className="space-y-3">
        <Link
          href="/orders"
          className="text-muted-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md text-sm outline-none focus-visible:ring-2"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("back")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("create")}</h1>
        <p className="text-muted-foreground text-sm">{t("createSubtitle")}</p>
      </header>
      <OrderForm />
    </div>
  );
}
