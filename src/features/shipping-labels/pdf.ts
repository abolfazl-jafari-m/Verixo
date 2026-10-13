import { jsPDF } from "jspdf";
import {
  formats,
  senderSchema,
  type LabelData,
  type LabelFormat,
  type SenderSettings,
} from "./model";
import { normalizePhone } from "@/features/orders/utils";

export type LabelMessages = {
  sender: string;
  recipient: string;
  phone: string;
  postalCode: string;
  order: string;
  title: string;
};
export function textDirection(value: string): "rtl" | "ltr" {
  return /[\u0600-\u06ff]/.test(value) ? "rtl" : "ltr";
}
// The same document powers the PDF preview, download, and print. No DOM rasterization.
export function buildLabelPdf(
  labels: LabelData[],
  sender: SenderSettings,
  format: LabelFormat,
  locale: string,
  messages: LabelMessages,
  font: string,
) {
  senderSchema.parse(sender);
  if (!labels.length) throw new Error("No labels");
  const { width, height } = formats[format];
  const pdf = new jsPDF({
    unit: "mm",
    format: [width, height],
    orientation: "portrait",
    compress: true,
    putOnlyUsedFonts: true,
  });
  pdf.addFileToVFS("Vazirmatn.ttf", font);
  pdf.addFont("Vazirmatn.ttf", "Vazirmatn", "normal");
  pdf.setFont("Vazirmatn");
  pdf.setLanguage(locale === "fa" ? "fa-IR" : "en-US");
  pdf.setProperties({ title: messages.title, creator: "Verixo" });
  const rtl = locale === "fa";
  const margin = 6;
  const usable = width - margin * 2;
  const draw = (text: string, y: number, size: number, maxWidth = usable) => {
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(text, maxWidth);
    const step = size * 0.352778 * 1.35;
    lines.forEach((line, index) =>
      pdf.text(line, rtl ? width - margin : margin, y + index * step, {
        align: rtl ? "right" : "left",
        isInputVisual: false,
        isOutputVisual: true,
        isInputRtl: textDirection(line) === "rtl",
        isOutputRtl: false,
      }),
    );
    return lines.length * step;
  };
  labels.forEach((label, index) => {
    if (index) pdf.addPage([width, height], "portrait");
    let y = 10;
    const logoSpace = sender.logo ? 18 : 0;
    if (sender.logo) {
      const image = pdf.getImageProperties(sender.logo);
      const scale = Math.min(14 / image.width, 14 / image.height);
      pdf.addImage(
        sender.logo,
        image.fileType,
        rtl ? margin : width - margin - 14,
        5,
        image.width * scale,
        image.height * scale,
      );
    }
    y += Math.max(draw(sender.shopName, y, 12, usable - logoSpace), logoSpace ? 13 : 5) + 2;
    y += draw(`${messages.order}: ${label.number}`, y, 9) + 3;
    pdf.setDrawColor(90);
    pdf.setLineWidth(0.25);
    pdf.line(margin, y - 2, width - margin, y - 2);
    y += 2;
    const blocks = [
      {
        heading: messages.sender,
        name: sender.senderName,
        phone: normalizePhone(sender.senderPhone),
        address: sender.senderAddress,
        postalCode: normalizePhone(sender.senderPostalCode),
      },
      { heading: messages.recipient, ...label.recipient },
    ];
    // Fit both blocks as one page, without truncating addresses or creating extra pages.
    const values = blocks.map((block) =>
      [
        block.heading,
        block.name,
        `${messages.phone}: ${block.phone}`,
        block.address,
        block.postalCode ? `${messages.postalCode}: ${block.postalCode}` : "",
      ].filter(Boolean),
    );
    let size = 10;
    const requiredHeight = (fontSize: number) => {
      pdf.setFontSize(fontSize);
      return (
        values
          .flat()
          .reduce(
            (sum, text) =>
              sum + pdf.splitTextToSize(text, usable).length * fontSize * 0.352778 * 1.35 + 1.5,
            0,
          ) + 7
      );
    };
    while (size > 8 && requiredHeight(size) > height - y - margin) size -= 0.5;
    if (requiredHeight(size) > height - y - margin)
      throw new Error("Label content exceeds the printable area");
    values.forEach((block, blockIndex) => {
      if (blockIndex) {
        y += 3;
        pdf.line(margin, y - 1, width - margin, y - 1);
        y += 3;
      }
      block.forEach((value) => {
        y += draw(value, y, size) + 1.5;
      });
    });
  });
  return pdf;
}

let fontPromise: Promise<string> | undefined;
export function loadLabelFont() {
  fontPromise ??= fetch("/fonts/Vazirmatn-Regular.ttf")
    .then(async (response) => {
      if (!response.ok) throw new Error("Font unavailable");
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    })
    .catch((error) => {
      fontPromise = undefined;
      throw error;
    });
  return fontPromise;
}
