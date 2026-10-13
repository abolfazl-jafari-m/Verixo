"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  useForm,
  useWatch,
  type DefaultValues,
  type FieldPath,
  type Resolver,
  type UseFormReturn,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { ActionFeedback, ContentSkeleton } from "@/components/shared";
import { settingsSchemas, type Settings, type SettingsSection } from "../../model";
import { useSettingsSection } from "../../use-settings";
import { saveSettingsSection } from "../../storage";
import { keepSettingsDraft, readSettingsDraft } from "../../drafts";

const resolvers: { [K in SettingsSection]: Resolver<Settings[K]> } = {
  shop: zodResolver(settingsSchemas.shop),
  invoices: zodResolver(settingsSchemas.invoices),
  shipping: zodResolver(settingsSchemas.shipping),
  reports: zodResolver(settingsSchemas.reports),
};

export function SectionEditor<K extends SettingsSection>({
  section,
  children,
}: {
  section: K;
  children: (form: UseFormReturn<Settings[K]>, setBusy: (busy: boolean) => void) => ReactNode;
}) {
  const state = useSettingsSection(section);
  const t = useTranslations("settings");
  if (!state.ready) return <ContentSkeleton />;
  return (
    <div className="space-y-4">
      {!state.available && <ActionFeedback kind="error" message={t("readError")} />}
      <Editor section={section} initial={state.value}>
        {children}
      </Editor>
    </div>
  );
}
function Editor<K extends SettingsSection>({
  section,
  initial,
  children,
}: {
  section: K;
  initial: Settings[K];
  children: (form: UseFormReturn<Settings[K]>, setBusy: (busy: boolean) => void) => ReactNode;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const form = useForm<Settings[K]>({
    // Schema and form share K; the assertion only bridges RHF's generic resolver inference.
    resolver: resolvers[section],
    defaultValues: initial as DefaultValues<Settings[K]>,
    mode: "onBlur",
  });
  const {
    reset,
    handleSubmit,
    getValues,
    formState: { isDirty, isSubmitting },
  } = form;
  const values = useWatch({ control: form.control });
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const lastLoaded = useRef(initial);
  useEffect(() => {
    if (lastLoaded.current !== initial) {
      lastLoaded.current = initial;
      if (!isDirty) reset(initial);
    }
  }, [initial, isDirty, reset]);
  const [leave, setLeave] = useState<string | null>(null);
  useEffect(() => {
    const draft = readSettingsDraft(section);
    if (draft) reset(draft, { keepDefaultValues: true });
  }, [section, reset]);
  useEffect(() => {
    keepSettingsDraft(section, isDirty ? getValues() : null);
  }, [section, isDirty, values, getValues]);
  useEffect(() => {
    if (!isDirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target === "_blank" ||
        event.metaKey ||
        event.ctrlKey
      )
        return;
      if (anchor.href !== window.location.href) {
        event.preventDefault();
        event.stopPropagation();
        setLeave(anchor.href);
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [isDirty]);
  return (
    <>
      <form
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit((value) => {
          setError(false);
          try {
            saveSettingsSection(section, value);
            reset(value);
            keepSettingsDraft(section, null);
            toast.add({ title: t("saved"), type: "success" });
          } catch {
            setError(true);
          }
        })}
      >
        <fieldset disabled={isSubmitting || busy} className="space-y-5">
          {children(form, setBusy)}
        </fieldset>
        {error && <ActionFeedback kind="error" message={t("saveError")} />}
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button type="submit" disabled={isSubmitting || busy}>
            {t("save")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || isSubmitting || busy}
            onClick={() => {
              reset(initial);
              keepSettingsDraft(section, null);
              setError(false);
            }}
          >
            {t("discard")}
          </Button>
          {isDirty && (
            <p role="status" className="text-muted-foreground text-xs">
              {t("unsaved")}
            </p>
          )}
        </div>
      </form>
      <Dialog
        open={!!leave}
        onOpenChange={(open) => {
          if (!open) setLeave(null);
        }}
      >
        <DialogContent showCloseButton={false} dir={locale === "fa" ? "rtl" : "ltr"}>
          <DialogTitle>{t("unsaved")}</DialogTitle>
          <DialogDescription>{t("leaveHint")}</DialogDescription>
          <div className="flex gap-2">
            <Button onClick={() => setLeave(null)}>{t("stay")}</Button>
            <Button
              variant="outline"
              onClick={() => {
                const target = leave;
                setLeave(null);
                keepSettingsDraft(section, null);
                reset(initial);
                if (target) router.push(target);
              }}
            >
              {t("leave")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SettingsField<V extends Settings[SettingsSection]>({
  form,
  name,
  label,
  multiline = false,
  dir,
  maxLength = 100,
}: {
  form: UseFormReturn<V>;
  name: FieldPath<V>;
  label: string;
  multiline?: boolean;
  dir?: "ltr" | "rtl";
  maxLength?: number;
}) {
  const t = useTranslations("shippingLabels.validation");
  const error = form.getFieldState(name, form.formState).error;
  const id = `setting-${name}`;
  const props = {
    id,
    ...form.register(name),
    dir,
    maxLength,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...props}
          rows={3}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-xl border p-3 text-sm outline-none focus-visible:ring-2"
        />
      ) : (
        <Input {...props} />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {t(error.message ?? "required")}
        </p>
      )}
    </div>
  );
}
export function SettingsSwitch<V extends Settings[SettingsSection]>({
  form,
  name,
  label,
}: {
  form: UseFormReturn<V>;
  name: FieldPath<V>;
  label: string;
}) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={!!field.value}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {label}
        </label>
      )}
    />
  );
}
export function SettingsSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const locale = useLocale();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <Select
        value={value}
        items={options}
        onValueChange={(value) => {
          if (value !== null) onChange(value);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent dir={locale === "fa" ? "rtl" : "ltr"}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
