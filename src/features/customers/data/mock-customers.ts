import type { Customer } from "../types";
import { customerIdentity } from "../utils";

// Contacts without orders demonstrate the empty-history state. Customers with
// purchases are derived from the shared Orders context, not a second dataset.
export const mockCustomers: Customer[] = [
  {
    id: customerIdentity("09171234567"),
    name: "سارا محمدی",
    phone: "09171234567",
    city: "شیراز",
    address: "شیراز، خیابان عفیف‌آباد، کوچه ۸، پلاک ۲۴",
  },
  {
    id: customerIdentity("09131234567"),
    name: "نیما کریمی",
    phone: "09131234567",
    city: "اصفهان",
    address: "",
  },
];
