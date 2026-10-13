import { z } from "zod";
import { shippingMethods } from "../types";
import { normalizePhone } from "../utils";

export const customerInformationSchema = z.object({
  name: z.string().trim().min(2, "required").max(100, "tooLong"),
  phone: z
    .string()
    .trim()
    .refine((value) => /^(?:\+98|0098|98|0)?9\d{9}$/.test(normalizePhone(value)), "phone"),
  province: z.string().trim().max(100, "tooLong"),
  city: z.string().trim().min(2, "required").max(100, "tooLong"),
  address: z.string().trim().min(5, "address").max(500, "tooLong"),
  postalCode: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{10}$/.test(normalizePhone(value)), "postalCode"),
  deliveryNotes: z.string().trim().max(1000, "tooLong"),
});

// No carrier contract exists yet: province and postal code remain optional.
export const customerFormSchema = customerInformationSchema.extend({
  shippingMethod: z.enum(shippingMethods, { error: "shippingMethod" }),
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
