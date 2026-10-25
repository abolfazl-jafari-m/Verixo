"use client";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigations";
import type { Order } from "../../types";
import { useOrdersStore } from "../orders-provider/orders-provider";

export function InventoryException({ order }: { order: Order }) {
  const t = useTranslations("inventory");
  const f = useFormatter();
  const resolveInventory = useOrdersStore((state) => state.resolveInventory);
  if (order.inventory?.state !== "exception") return null;
  return (
    <section
      className="bg-warning-50 text-warning-900 dark:bg-warning-900/20 dark:text-warning-200 space-y-2 rounded-xl p-3 text-sm"
      aria-label={t("exception")}
    >
      <p className="font-semibold">{t("exception")}</p>
      <p>{t(order.inventory.reason === "storage" ? "storageException" : "exceptionHint")}</p>
      <ul>
        {order.inventory.issues.map((issue, index) => (
          <li key={index}>
            {issue.name}:{" "}
            {t("required", {
              quantity: f.number(issue.quantity),
              available: f.number(issue.available),
            })}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Link className="underline" href="/inventory">
          {t("title")}
        </Link>
        <Button size="sm" variant="secondary" onClick={() => resolveInventory(order.id)}>
          {t("resolve")}
        </Button>
      </div>
    </section>
  );
}
