"use client";
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
        style={{ margin: 0, background: "#fafafa", color: "#171717", fontFamily: "sans-serif" }}
      >
        <main style={{ maxWidth: 480, margin: "15vh auto", padding: 24 }}>
          <h1>{t.errorTitle}</h1>
          <p>{t.errorDescription}</p>
          <button onClick={reset} style={{ padding: "12px 20px", cursor: "pointer" }}>
            {t.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
