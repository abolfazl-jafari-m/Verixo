export type ProductType = "simple" | "variable";
export type ProductStatus = "active" | "draft" | "archived";

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
  useForVariants: boolean;
}

export interface InventoryFields {
  stock: number;
  trackInventory?: boolean;
  reservedQuantity?: number;
  lowStockThreshold?: number;
}

export interface ProductVariant extends InventoryFields {
  id: string;
  sku?: string;
  attributeValues: Record<string, string>;
  price: number;
  costPrice: number | null;
  isActive: boolean;
}

export interface ProductBase {
  id: string;
  name: string;
  description: string;
  sku?: string;
  images: string[];
  status: ProductStatus;
  attributes: ProductAttribute[];
  createdAt: string;
}

export interface SimpleProduct extends ProductBase, InventoryFields {
  type: "simple";
  price: number;
  costPrice: number | null;
}

export interface VariableProduct extends ProductBase {
  type: "variable";
  variants: ProductVariant[];
}

export type Product = SimpleProduct | VariableProduct;
