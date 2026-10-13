"use client";
import { useState } from "react";
import { SettingsUnavailableError } from "@/features/settings/storage";
import { ActionFeedback } from "@/components/shared";

import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormatter, useTranslations } from "next-intl";
import { Package, ReceiptText, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/lib/i18n/navigations";
import { createOrderFormSchema, type OrderFormValues } from "../../schemas/order-schema";
import { useQuery } from "@tanstack/react-query";
import { productService, productQueryKey } from "@/features/products/services/product-service";
import { AppState, ContentSkeleton } from "@/components/shared";
import { orderTotals, createOrderLines } from "../../utils";
import { useOrders } from "../orders-provider/orders-provider";
import { OrderPaymentField } from "../order-payment-field/order-payment-field";
import { ProductPicker } from "./product-picker";
import { OrderProductRow } from "./order-product-row";

export function OrderForm() {
  const t = useTranslations("orders");
  const settings = useTranslations("settings");
  const [settingsError, setSettingsError] = useState(false);
  const f = useFormatter();
  const router = useRouter();
  const { createOrder } = useOrders();
  const catalog = useQuery({ queryKey: productQueryKey, queryFn: productService.list });
  const products = catalog.data ?? [];
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(createOrderFormSchema(products)),
    mode: "onChange",
    defaultValues: {
      notes: "",
      payment: "pending",
      shipping: 0,
      lines: [],
    },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  const items = useFieldArray({ control, name: "lines" });
  const payment = useWatch({ control, name: "payment" });
  const lines = useWatch({ control, name: "lines" });
  const shipping = useWatch({ control, name: "shipping" });
  const totals = orderTotals(
    createOrderLines(lines, products),
    Number.isFinite(shipping) && shipping >= 0 ? shipping : 0,
  );
  function submit(data: OrderFormValues) {
    setSettingsError(false);
    try {
      createOrder({
        notes: data.notes,
        lines: createOrderLines(data.lines, products),
        shipping: data.shipping,
        payment: data.payment,
      });
    } catch (error) {
      if (error instanceof SettingsUnavailableError) {
        setSettingsError(true);
        return;
      }
      throw error;
    }
    router.push("/orders");
  }
  if (catalog.isPending) return <ContentSkeleton />;
  if (catalog.isError)
    return (
      <AppState
        kind="error"
        title={t("catalogError")}
        action={<Button onClick={() => void catalog.refetch()}>{t("retryCatalog")}</Button>}
      />
    );
  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        aria-busy={isSubmitting}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="flex min-w-0 flex-col gap-6">
          {settingsError && (
            <ActionFeedback kind="error" message={settings("orderSettingsError")} />
          )}
          <p className="bg-muted/30 text-muted-foreground rounded-xl p-4 text-sm leading-6">
            {t("customerFlow.operatorHint")}
          </p>
          <section
            className="border-border/40 bg-card flex flex-col gap-5 rounded-2xl border p-4 shadow-xs sm:p-6"
            aria-labelledby="products-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <ShoppingBag className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="products-heading" className="font-semibold">
                    {t("products")}
                  </h2>
                  <p className="text-muted-foreground text-xs">{t("productsHint")}</p>
                </div>
              </div>
              <ProductPicker
                catalog={products}
                onAdd={(productId) =>
                  items.append({ productId, variantId: "", quantity: 1 }, { shouldFocus: false })
                }
              />
            </div>
            {items.fields.length === 0 && (
              <div className="border-border/60 text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center text-sm">
                <Package className="size-7" />
                <p>{t("emptyProducts")}</p>
              </div>
            )}
            {items.fields.map((field, index) => (
              <OrderProductRow
                products={products}
                key={field.id}
                index={index}
                onRemove={() => items.remove(index)}
              />
            ))}
            {(errors.lines?.root?.message || errors.lines?.message) && (
              <p role="alert" className="text-destructive text-sm">
                {t(`errors.${errors.lines.root?.message ?? errors.lines.message}`)}
              </p>
            )}
          </section>
          <section className="bg-card border-border/40 space-y-3 rounded-2xl border p-4 sm:p-6">
            <label htmlFor="order-notes" className="text-sm font-medium">
              {t("notes")}
            </label>
            <textarea
              id="order-notes"
              rows={3}
              {...register("notes")}
              aria-invalid={!!errors.notes}
              aria-describedby={errors.notes ? "order-notes-error" : undefined}
              className="bg-input/50 border-border/50 focus-visible:ring-ring w-full rounded-xl border p-3 text-sm outline-none focus-visible:ring-2"
            />
            {errors.notes?.message && (
              <p id="order-notes-error" role="alert" className="text-destructive text-xs">
                {t(`errors.${errors.notes.message}`)}
              </p>
            )}
          </section>
        </div>
        <aside className="border-primary/15 bg-card flex flex-col gap-5 rounded-2xl border p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
          <header className="border-border/50 flex items-center gap-3 border-b pb-4">
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <ReceiptText className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold">{t("orderSummary")}</h2>
              <p className="text-muted-foreground text-xs">
                {t("itemCount", { count: totals.count })}
              </p>
            </div>
          </header>
          <OrderPaymentField />
          <div className="bg-muted/30 dark:bg-foreground/5 rounded-xl p-3 text-xs leading-relaxed">
            <p className="mb-1 font-medium">
              {t("initialStatus")}:{" "}
              {t(`statuses.${payment === "paid" ? "paid" : "pending_payment"}`)}
            </p>
            <p className="text-muted-foreground">{t("initialHint")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="order-shipping" className="text-sm font-medium">
              {t("shipping")} ({t("currency")})
            </label>
            <Input
              id="order-shipping"
              type="number"
              min={0}
              step={1}
              className="h-10 rounded-xl"
              {...register("shipping", { valueAsNumber: true })}
              aria-invalid={!!errors.shipping}
              aria-describedby={errors.shipping ? "shipping-error" : undefined}
            />
            {errors.shipping?.message && (
              <p id="shipping-error" className="text-destructive text-xs" role="alert">
                {t(`errors.${errors.shipping.message}`)}
              </p>
            )}
          </div>
          <dl className="bg-muted/25 flex flex-col gap-3 rounded-xl p-4 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("subtotal")}</dt>
              <dd>
                {f.number(totals.subtotal)} {t("currency")}
              </dd>
            </div>
            <div className="text-muted-foreground flex items-center justify-between gap-2">
              <dt className="flex items-center gap-1">
                <Truck className="size-3.5" />
                {t("shipping")}
              </dt>
              <dd>
                {f.number(Number.isFinite(shipping) && shipping >= 0 ? shipping : 0)}{" "}
                {t("currency")}
              </dd>
            </div>
            <div className="border-border/50 flex flex-col gap-2 border-t pt-3 font-semibold">
              <dt>{t("total")}</dt>
              <dd>
                {f.number(totals.total)} {t("currency")}
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground text-xs leading-relaxed">{t("demo")}</p>
          <div className="grid gap-2">
            <Button type="submit" className="h-12 rounded-xl shadow-sm" disabled={isSubmitting}>
              {t(isSubmitting ? "saving" : "save")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              disabled={isSubmitting}
              onClick={() => router.push("/orders")}
            >
              {t("cancel")}
            </Button>
          </div>
        </aside>
      </form>
    </FormProvider>
  );
}
