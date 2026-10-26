"use client";
import { ActionSpinner, ActionFeedback } from "@/components/shared";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "../../schemas/product-schema";
import { FormInput } from "../product-form/form-fields";

async function readImage(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2_000_000)
    throw new Error("image");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("image"));
    reader.onerror = () => reject(new Error("image"));
    reader.onabort = () => reject(new Error("image"));
    reader.readAsDataURL(file);
  });
  const image = new window.Image();
  image.src = data;
  await image.decode();
  if (!image.naturalWidth || image.naturalWidth > 4096 || image.naturalHeight > 4096)
    throw new Error("image");
  return data;
}

export function ProductImageUpload({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const t = useTranslations("products");
  const id = useId();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<ProductFormValues>();
  const images = useFieldArray({ control, name: "images" });
  const [busy, setBusy] = useState(false);
  const reading = useRef(false);
  const [error, setError] = useState(false);
  return (
    <section className="space-y-4" aria-labelledby={id + "-heading"} aria-busy={busy}>
      <h3 id={id + "-heading"} className="text-lg font-semibold">
        {t("images")}
      </h3>
      <div className="bg-muted/25 border-border/70 space-y-3 rounded-2xl border border-dashed p-5">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
          <ImagePlus className="text-primary size-5" aria-hidden="true" />
          {t("uploadImages")}
        </label>
        <p id={id + "-hint"} className="text-muted-foreground text-xs leading-6">
          {t("uploadHint")}
        </p>
        <Input
          id={id}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          disabled={busy || isSubmitting}
          aria-describedby={id + "-hint"}
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (!files.length || reading.current) return;
            reading.current = true;
            setBusy(true);
            onBusyChange(true);
            setError(false);
            try {
              const urls = [];
              for (const file of files) urls.push(await readImage(file));
              images.append(urls.map((url) => ({ url })));
            } catch {
              setError(true);
            } finally {
              reading.current = false;
              setBusy(false);
              onBusyChange(false);
            }
          }}
        />
        {busy && (
          <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
            <ActionSpinner />
            {t("readingImages")}
          </p>
        )}
        {error && <ActionFeedback kind="error" message={t("uploadError")} />}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-muted/20 flex min-w-0 items-center gap-3 rounded-xl p-3"
          >
            {field.url.startsWith("data:image/") ? (
              <>
                <Image
                  unoptimized
                  src={field.url}
                  alt={t("imageNumber", { number: index + 1 })}
                  width={80}
                  height={80}
                  className="size-20 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 text-sm">
                  {t("imageNumber", { number: index + 1 })}
                </span>
              </>
            ) : (
              <div className="min-w-0 flex-1">
                <FormInput
                  name={`images.${index}.url`}
                  label={t("imageNumber", { number: index + 1 })}
                  type="url"
                  dir="ltr"
                />
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              aria-label={t("removeImage", { number: index + 1 })}
              onClick={() => images.remove(index)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        disabled={busy}
        onClick={() => images.append({ url: "" })}
      >
        <Plus aria-hidden="true" />
        {t("addImage")}
      </Button>
    </section>
  );
}
