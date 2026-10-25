"use client";
import { useOrdersStore } from "@/features/orders/components/orders-provider/orders-provider";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportCsv, reportTables } from "../../export-data";
import { downloadReport, printReport, reportWorkbook } from "../../exports";
import { useReportData } from "../report-provider/report-provider";

export function ReportExports() {
  const { report, previous } = useReportData(true);
  const ready = useOrdersStore((state) => state.ready);
  const locale = useLocale();
  const t = useTranslations("reports");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"exportFailed" | "exported" | "printHint" | null>(null);
  async function run(format: "csv" | "xlsx" | "pdf") {
    if (!report) return;
    setBusy(format);
    setFeedback(null);
    try {
      const generated = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Tehran",
        calendar: "persian",
      }).format(new Date());
      const tables = reportTables(report, previous, t, locale, generated);
      const filename = `verixo-${report.range.from}-${report.range.to}`;
      if (format === "csv")
        downloadReport(
          new Blob([reportCsv(tables)], { type: "text/csv;charset=utf-8" }),
          `${filename}.csv`,
        );
      else if (format === "xlsx")
        downloadReport(
          new Blob([await reportWorkbook(tables, locale)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `${filename}.xlsx`,
        );
      else await printReport(tables, t("title"), locale, t("unavailable"));
      setFeedback(format === "pdf" ? "printHint" : "exported");
    } catch {
      setFeedback("exportFailed");
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(["csv", "xlsx", "pdf"] as const).map((format) => (
          <Button
            key={format}
            variant="outline"
            size="sm"
            disabled={!ready || !report || busy !== null}
            onClick={() => void run(format)}
          >
            {format === "pdf" ? <Printer className="size-4" /> : <Download className="size-4" />}
            {busy === format ? t("exporting") : t(`exports.${format}`)}
          </Button>
        ))}
      </div>
      {feedback && (
        <p
          role={feedback === "exportFailed" ? "alert" : "status"}
          className="max-w-sm text-xs leading-5"
        >
          {t(feedback)}
        </p>
      )}
    </div>
  );
}
