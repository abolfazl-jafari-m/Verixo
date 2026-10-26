import { z } from "zod";

export const discountPercentageSchema = z
  .number({ error: "discount" })
  .finite("discount")
  .min(0, "discount")
  .max(100, "discount")
  .multipleOf(0.01, "discount");
