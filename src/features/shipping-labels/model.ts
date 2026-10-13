import { z } from "zod";
import { customerInformationSchema } from "@/features/orders/schemas/customer-information-schema";
import { orderStatuses, type Order } from "@/features/orders/types";
import { normalizePhone } from "@/features/orders/utils";

export const formats = {
  a6: { width: 105, height: 148 },
  thermal: { width: 101.6, height: 152.4 },
} as const;
export type LabelFormat = keyof typeof formats;
export const senderSchema = z.object({
  shopName: z.string().trim().min(2, "required").max(100, "tooLong"),
  senderName: z.string().trim().max(100, "tooLong"),
  senderPhone: z
    .string()
    .trim()
    .refine((value) => /^\+?\d{7,15}$/.test(normalizePhone(value)), "phone"),
  senderAddress: customerInformationSchema.shape.address,
  senderPostalCode: customerInformationSchema.shape.postalCode,
  logo: z
    .string()
    .max(1_400_000)
    .refine(
      (value) => !value || /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value),
      "logo",
    ),
});
export type SenderSettings = z.infer<typeof senderSchema>;
export const emptySender: SenderSettings = {
  shopName: "",
  senderName: "",
  senderPhone: "",
  senderAddress: "",
  senderPostalCode: "",
  logo: "",
};
const recipientSchema = customerInformationSchema.pick({
  name: true,
  phone: true,
  city: true,
  address: true,
});
export function recipientIssues(order: Order): string[] {
  const result = recipientSchema.safeParse(order.customer);
  return result.success
    ? []
    : order.customer
      ? result.error.issues.map((issue) => String(issue.path[0]))
      : ["name", "phone", "city", "address"];
}
// Match the board's status columns, preserving source order within each column.
export function selectedOrders(orders: Order[], ids: readonly string[]) {
  const selected = new Set(ids);
  return orderStatuses.flatMap((status) =>
    orders.filter((order) => order.status === status && selected.has(order.id)),
  );
}
export function toggleSelection(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}
export function selectDisplayed(orders: Order[], checked: boolean): string[] {
  return checked ? orders.map((order) => order.id) : [];
}
export function partitionOrders(orders: Order[]) {
  return {
    valid: orders.filter((order) => !recipientIssues(order).length),
    invalid: orders.filter((order) => recipientIssues(order).length),
  };
}
export type LabelData = {
  id: string;
  number: string;
  recipient: { name: string; phone: string; address: string; postalCode: string };
};
export function toLabel(order: Order): LabelData {
  if (recipientIssues(order).length || !order.customer) throw new Error("Invalid recipient");
  const customer = order.customer;
  return {
    id: order.id,
    number: order.number,
    recipient: {
      name: customer.name.trim(),
      phone: normalizePhone(customer.phone),
      address: [customer.province.trim(), customer.city.trim(), customer.address.trim()]
        .filter(Boolean)
        .join(" · "),
      postalCode: normalizePhone(customer.postalCode),
    },
  };
}
