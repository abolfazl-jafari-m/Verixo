import { z } from "zod";

export function normalizePaymentIdentifier(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\s-]/g, "");
}
export const emptyPaymentInformation = {
  enabled: false,
  accountHolder: "",
  cardNumber: "",
  accountNumber: "",
};
// Permit unfinished input in recoverable session drafts.
export const paymentInformationFields = z.object({
  enabled: z.boolean(),
  accountHolder: z.string().trim().max(100, "tooLong"),
  cardNumber: z.string().max(40, "tooLong"),
  accountNumber: z.string().max(100, "tooLong"),
});
const normalizedPaymentInformation = paymentInformationFields.extend({
  cardNumber: paymentInformationFields.shape.cardNumber
    .transform(normalizePaymentIdentifier)
    .refine((value) => !value || /^\d{16}$/.test(value), "cardNumber"),
  accountNumber: paymentInformationFields.shape.accountNumber
    .transform(normalizePaymentIdentifier)
    .refine((value) => !value || /^\d+$/.test(value), "accountNumber"),
});
export const paymentInformationSchema = normalizedPaymentInformation.superRefine((value, ctx) => {
  if (!value.enabled) return;
  if (!value.accountHolder)
    ctx.addIssue({ code: "custom", path: ["accountHolder"], message: "required" });
  if (!value.cardNumber && !value.accountNumber)
    ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "paymentIdentifier" });
});
export type PaymentInformation = z.infer<typeof paymentInformationSchema>;
// enabled is retained only to interpret old snapshots; new invoices own visibility.
export function configuredPaymentInformation(payment: PaymentInformation | undefined) {
  if (!payment) return undefined;
  const result = paymentInformationSchema.safeParse({ ...payment, enabled: true });
  return result.success ? result.data : undefined;
}
export function invoiceShowsPaymentDetails(
  payment: PaymentInformation | undefined,
  showPaymentDetails?: boolean,
) {
  return showPaymentDetails ?? payment?.enabled ?? true;
}
export function visiblePaymentInformation(
  payment: PaymentInformation | undefined,
  showPaymentDetails?: boolean,
) {
  return invoiceShowsPaymentDetails(payment, showPaymentDetails)
    ? configuredPaymentInformation(payment)
    : undefined;
}

// Settings collect bank information only. The deprecated flag must not prevent
// clearing an old enabled configuration now that there is no global switch.
export const bankInformationSchema = normalizedPaymentInformation.superRefine((value, ctx) => {
  if (!value.accountHolder && !value.cardNumber && !value.accountNumber) return;
  const result = paymentInformationSchema.safeParse({ ...value, enabled: true });
  if (!result.success)
    for (const issue of result.error.issues)
      ctx.addIssue({ code: "custom", path: issue.path, message: issue.message });
});
