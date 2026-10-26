import { discountPercentageSchema } from "@/features/orders/schemas/discount-schema";
import { z } from "zod";

import { paymentInformationSchema } from "../payment-information";

const localizedText = z.object({ fa: z.string(), en: z.string() });
export const invoiceRecordSchema = z.object({
  showPaymentDetails: z.boolean().optional(),
  discountPercentage: discountPercentageSchema.optional(),
  id: z.string(),
  orderId: z.string(),
  number: z.string(),
  createdAt: z.iso.datetime(),
  publicToken: z.string(),
  settingsSnapshot: z.object({
    paymentInformation: paymentInformationSchema.optional(),
    template: z.literal("standard"),
    shopName: localizedText,
    contact: z.string(),
    logo: z.string().optional(),
    introduction: localizedText,
    footer: localizedText,
  }),
});

const amount = z
  .number({ error: "amount" })
  .finite("amount")
  .min(0, "amount")
  .max(100000000, "amount");
export const invoiceEditSchema = z.object({
  showPaymentDetails: z.boolean().optional(),
  discountPercentage: discountPercentageSchema.optional(),
  unitPrices: z.array(z.object({ value: amount })).min(1),
  shipping: amount,
});
export type InvoiceEditValues = z.infer<typeof invoiceEditSchema>;
