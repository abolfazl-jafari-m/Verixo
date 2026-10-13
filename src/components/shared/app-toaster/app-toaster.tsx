"use client";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, CircleAlert } from "lucide-react";
import {
  ToastProvider,
  ToastPortal,
  ToastViewport,
  Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastClose,
  toast,
  useToastManager,
} from "@/components/ui/toast";
function Notifications() {
  const { toasts } = useToastManager();
  const t = useTranslations("appStates");
  const locale = useLocale();
  return (
    <ToastPortal>
      <ToastViewport
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="bottom-24 z-[100] md:bottom-4"
      >
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} className="motion-reduce:transition-none">
            <ToastContent>
              {item.type === "error" ? (
                <CircleAlert className="text-destructive size-5 shrink-0" aria-hidden="true" />
              ) : (
                <CircleCheck className="text-primary size-5 shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <ToastTitle />
                {item.description && <ToastDescription />}
              </div>
              <ToastClose aria-label={t("close")} />
            </ToastContent>
          </Toast>
        ))}
      </ToastViewport>
    </ToastPortal>
  );
}
export function AppToaster({ children }: { children: ReactNode }) {
  return (
    <ToastProvider toastManager={toast} timeout={5000} limit={3}>
      {children}
      <Notifications />
    </ToastProvider>
  );
}
