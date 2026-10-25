import { getLocale } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigations";
export default async function Page() {
  redirect({ href: "/settings?tab=shipping", locale: await getLocale() });
}
