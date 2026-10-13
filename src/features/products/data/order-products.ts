import type { Product } from "../types";

// Existing order-picker fixtures now belong to the shared product catalog.
const base = {
  description: "",
  images: [],
  status: "active",
  createdAt: "2026-10-01T08:00:00.000Z",
} as const;
export const orderProducts: Product[] = [
  {
    ...base,
    images: [],
    id: "order-mug",
    name: "ماگ سرامیکی دست‌ساز",
    type: "simple",
    sku: "MUG-01",
    price: 285000,
    costPrice: 150000,
    stock: 24,
    attributes: [],
  },
  {
    ...base,
    images: [],
    id: "order-bag",
    name: "کیف پارچه‌ای آفتاب",
    type: "simple",
    sku: "BAG-02",
    price: 390000,
    costPrice: null,
    stock: 18,
    attributes: [],
  },
  {
    ...base,
    images: [],
    id: "order-shirt",
    name: "تیشرت نخی کلاسیک",
    type: "variable",
    sku: "TS-03",
    attributes: [
      { id: "color", name: "رنگ", values: ["مشکی", "کرم"], useForVariants: true },
      { id: "size", name: "سایز", values: ["M", "L"], useForVariants: true },
    ],
    variants: [
      {
        id: "shirt-black-m",
        attributeValues: { color: "مشکی", size: "M" },
        price: 620000,
        costPrice: 360000,
        stock: 12,
        isActive: true,
      },
      {
        id: "shirt-black-l",
        attributeValues: { color: "مشکی", size: "L" },
        price: 620000,
        costPrice: 360000,
        stock: 8,
        isActive: true,
      },
      {
        id: "shirt-cream-m",
        attributeValues: { color: "کرم", size: "M" },
        price: 650000,
        costPrice: null,
        stock: 6,
        isActive: true,
      },
      {
        id: "shirt-cream-l",
        attributeValues: { color: "کرم", size: "L" },
        price: 650000,
        costPrice: null,
        stock: 0,
        isActive: true,
      },
    ],
  },
];
