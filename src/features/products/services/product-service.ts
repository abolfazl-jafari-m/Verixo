import type { Product } from "../types";
import { orderProducts } from "../data/order-products";
import { inventoryRepository } from "@/features/inventory/repository";

export const productQueryKey = ["products", "demo"] as const;

const sampleNames = [
  "Canvas tote",
  "Ceramic mug",
  "Linen notebook",
  "Cotton scarf",
  "Desk organizer",
  "Travel pouch",
  "Glass bottle",
  "Woven basket",
  "Soy candle",
  "Gift wrap",
  "Leather bookmark",
];
const seedProducts: Product[] = sampleNames.map((name, index) => ({
  id: `demo-${index}`,
  name,
  description: "",
  sku: `VX-${100 + index}`,
  images: [],
  status: index === 3 ? "archived" : index % 3 === 0 ? "draft" : "active",
  type: "simple",
  price: 120000 + index * 35000,
  costPrice: null,
  stock: index * 3,
  attributes: [],
  createdAt: "2026-01-01T00:00:00.000Z",
}));
seedProducts.unshift({
  id: "demo-variable",
  name: "Everyday T-shirt",
  description: "Soft cotton everyday essential.",
  sku: "VX-TEE",
  images: [],
  status: "active",
  type: "variable",
  createdAt: "2026-01-02T00:00:00.000Z",
  attributes: [
    { id: "color", name: "Color", values: ["Black", "White"], useForVariants: true },
    { id: "fabric", name: "Fabric", values: ["Cotton"], useForVariants: false },
  ],
  variants: [
    {
      id: "tee-black",
      sku: "VX-TEE-B",
      attributeValues: { color: "Black" },
      price: 450000,
      costPrice: null,
      stock: 12,
      isActive: true,
    },
    {
      id: "tee-white",
      sku: "VX-TEE-W",
      attributeValues: { color: "White" },
      price: 480000,
      costPrice: null,
      stock: 8,
      isActive: true,
    },
  ],
});

// Browser-local demo repository. Replace this boundary with the real API when available.
inventoryRepository.seed([...orderProducts, ...seedProducts]);
export const productService = {
  async list(): Promise<Product[]> {
    return inventoryRepository.list();
  },
  async save(product: Product): Promise<Product> {
    return inventoryRepository.save(product);
  },
};
