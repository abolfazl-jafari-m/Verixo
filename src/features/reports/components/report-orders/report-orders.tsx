"use client";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useReport } from "../report-provider/report-provider";

export function ReportOrders() {
  const { report } = useReport();
  const t = useTranslations("reports");
  const locale = useLocale();
  if (!report) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orderAnalytics")}</CardTitle>
        <CardDescription>{t("createdHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(
            [
              "total",
              "paid",
              "unpaid",
              "cancelled",
              "cancellationRate",
              "cancelledInPeriod",
            ] as const
          ).map((key) => (
            <div key={key}>
              <dt className="text-muted-foreground text-xs leading-5">{t(`analytics.${key}`)}</dt>
              <dd className="mt-2 text-lg font-semibold">
                {report.analytics[key] === null
                  ? t("unavailable")
                  : new Intl.NumberFormat(
                      locale,
                      key === "cancellationRate"
                        ? { style: "percent", maximumFractionDigits: 1 }
                        : {},
                    ).format(report.analytics[key])}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-muted-foreground text-xs leading-6">{t("cancellationHint")}</p>
        <Table>
          <TableHeader>
            <TableRow>
              {["status", "count", "amount"].map((key) => (
                <TableHead key={key} className="text-start">
                  {t(key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.statuses.map((row) => (
              <TableRow key={row.status}>
                <TableCell>{t(`statuses.${row.status}`)}</TableCell>
                <TableCell>{new Intl.NumberFormat(locale).format(row.count)}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat(locale).format(row.amount)} {t("currency")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-muted-foreground text-xs">{t("statusHint")}</p>
      </CardContent>
    </Card>
  );
}
