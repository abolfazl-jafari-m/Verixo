import type { ReportTable } from "./export-data";

export function downloadReport(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function reportWorkbook(tables: ReportTable[], locale: string) {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  for (const table of tables) {
    const sheet = workbook.addWorksheet(table.name.slice(0, 31), {
      views: [{ state: "frozen", ySplit: 1, rightToLeft: locale === "fa" }],
    });
    sheet.addRow(table.headers);
    table.rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((column, index) => {
      column.width = index === 0 ? 38 : 24;
      column.numFmt = "#,##0.##";
    });
    sheet.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
  }
  return workbook.xlsx.writeBuffer();
}
const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );
export async function printReport(
  tables: ReportTable[],
  title: string,
  locale: string,
  unavailable: string,
) {
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.style.cssText = "position:fixed;inset:0;width:0;height:0;border:0";
  const styles = [...document.querySelectorAll('style,link[rel="stylesheet"]')]
    .map((element) => element.outerHTML)
    .join("");
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const html = `<!doctype html><html lang="${escapeHtml(locale)}" class="${escapeHtml(document.documentElement.className)}" dir="${locale === "fa" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>${styles}<style>@page{size:A4 landscape;margin:12mm}body{font-family:var(--font-varzir),var(--font-inter),sans-serif;color:black;background:white;font-size:10pt}h1{font-size:22px;margin-bottom:16px}h2{font-size:15px;margin:18px 0 8px}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{text-align:start;padding:7px;border-bottom:1px solid #ddd;overflow-wrap:anywhere}th{background:#eee}thead{display:table-header-group}tr{break-inside:avoid}h2{break-after:avoid}</style></head><body><h1>${escapeHtml(title)}</h1>${tables.map((table) => `<h2>${escapeHtml(table.name)}</h2><table><thead><tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((value, index) => `<td colspan="${index === row.length - 1 ? table.headers.length - row.length + 1 : 1}">${escapeHtml(value === null ? unavailable : typeof value === "number" ? formatter.format(value) : value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`).join("")}</body></html>`;
  await new Promise<void>((resolve, reject) => {
    frame.onload = () => resolve();
    frame.onerror = () => reject(new Error("Print document failed"));
    frame.srcdoc = html;
    document.body.append(frame);
  });
  if (!frame.contentWindow || !frame.contentDocument) {
    frame.remove();
    throw new Error("Print unavailable");
  }
  await frame.contentDocument.fonts.ready;
  frame.contentWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
  frame.contentWindow.focus();
  frame.contentWindow.print();
}
