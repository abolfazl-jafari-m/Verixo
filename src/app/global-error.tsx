"use client";
import { CircleAlert } from "lucide-react";
import en from "@/locales/en.json";
import fa from "@/locales/fa.json";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const english = typeof window !== "undefined" && /^\/en(?:\/|$)/.test(window.location.pathname);
  const t = (english ? en : fa).appStates;
  return (
    <html lang={english ? "en" : "fa"} dir={english ? "ltr" : "rtl"}>
      <body
        style={{
          margin: 0,
          background: "light-dark(#fafafa, #171717)",
          color: "light-dark(#171717, #fafafa)",
          colorScheme: "light dark",
          fontFamily: "sans-serif",
        }}
      >
        <main style={{ maxWidth: 480, margin: "15vh auto", padding: 24 }}>
          <CircleAlert aria-hidden="true" size={40} />
          <h1>{t.errorTitle}</h1>
          <p style={{ lineHeight: 1.7 }}>{t.errorDescription}</p>
          <button
            onClick={reset}
            style={{
              padding: "12px 20px",
              cursor: "pointer",
              borderRadius: 12,
              border: "1px solid currentColor",
              background: "transparent",
              color: "inherit",
              font: "inherit",
            }}
          >
            {t.retry}
          </button>
          <a
            href={english ? "/en" : "/"}
            style={{
              display: "inline-block",
              marginInlineStart: 20,
              padding: "12px 0",
              color: "inherit",
            }}
          >
            {t.home}
          </a>
        </main>
      </body>
    </html>
  );
}
